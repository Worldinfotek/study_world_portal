param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadPath
)

function Convert-SqlValue($v) {
  if ($null -eq $v -or [System.DBNull]::Equals($v, [DBNull]::Value) -or $v -eq [DBNull]::Value) {
    return $null
  }
  if ($v -is [datetime]) { return ([datetime]$v).ToUniversalTime().ToString('o') }
  if ($v -is [datetimeoffset]) { return ([datetimeoffset]$v).UtcDateTime.ToString('o') }
  if ($v -is [guid]) { return $v.ToString() }
  if ($v -is [byte[]]) { return [Convert]::ToBase64String($v) }
  if ($v -is [decimal] -or $v -is [uint64]) { return [double]$v }
  if ($v -is [bool] -or $v -is [byte] -or $v -is [int16] -or $v -is [uint16] -or $v -is [int] -or $v -is [uint32] -or $v -is [long] -or $v -is [double] -or $v -is [float] -or $v -is [string]) {
    return $v
  }
  return [string]$v
}

function Convert-ParamValue($val) {
  if ($null -eq $val) { return [DBNull]::Value }
  if ($val -is [bool]) { return [bool]$val }
  if (($val -is [System.Management.Automation.PSCustomObject]) -or ($val -is [hashtable]) -or ($val -is [System.Collections.IDictionary])) {
    return ($val | ConvertTo-Json -Compress -Depth 20)
  }
  return $val
}

function Read-Table($connection, $query, $params) {
  $cmd = $connection.CreateCommand()
  $cmd.CommandText = [string]$query
  $cmd.CommandTimeout = 120
  if ($null -ne $params) {
    foreach ($p in $params.PSObject.Properties) {
      [void]$cmd.Parameters.AddWithValue('@' + $p.Name, (Convert-ParamValue $p.Value))
    }
  }
  $adapter = New-Object System.Data.SqlClient.SqlDataAdapter $cmd
  $table = New-Object System.Data.DataTable
  [void]$adapter.Fill($table)

  $rows = New-Object System.Collections.ArrayList
  foreach ($row in $table.Rows) {
    $obj = New-Object System.Collections.Hashtable
    foreach ($col in $table.Columns) {
      $obj[$col.ColumnName] = Convert-SqlValue $row[$col.ColumnName]
    }
    [void]$rows.Add($obj)
  }
  Write-Output -NoEnumerate $rows
}

function Convert-RowsToJson($rows) {
  Add-Type -AssemblyName System.Web.Extensions
  $serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
  $serializer.MaxJsonLength = [int]::MaxValue
  $serializer.RecursionLimit = 100
  $list = New-Object System.Collections.ArrayList
  if ($null -eq $rows) {
    return '[]'
  }
  if ($rows -is [System.Collections.ArrayList]) {
    $list = $rows
  } elseif ($rows -is [System.Collections.IDictionary]) {
    [void]$list.Add($rows)
  } elseif ($rows -is [System.Collections.IEnumerable] -and -not ($rows -is [string])) {
    foreach ($r in $rows) {
      if ($r -is [System.Collections.IDictionary]) {
        [void]$list.Add($r)
      }
    }
  } else {
    [void]$list.Add($rows)
  }
  return $serializer.Serialize($list.ToArray())
}

function Write-JsonFile($json, $outPath) {
  [System.IO.File]::WriteAllText($outPath, [string]$json, [System.Text.UTF8Encoding]::new($false))
}

$ErrorActionPreference = 'Stop'
$payload = Get-Content -Raw -Encoding UTF8 -Path $PayloadPath | ConvertFrom-Json
$conn = New-Object System.Data.SqlClient.SqlConnection $payload.connectionString
$conn.Open()
try {
  if ($payload.execute -eq $true) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = [string]$payload.query
    $cmd.CommandTimeout = 120
    if ($null -ne $payload.params) {
      foreach ($p in $payload.params.PSObject.Properties) {
        [void]$cmd.Parameters.AddWithValue('@' + $p.Name, (Convert-ParamValue $p.Value))
      }
    }
    $affected = $cmd.ExecuteNonQuery()
    Write-Output (@{ rowsAffected = [int]$affected } | ConvertTo-Json -Compress)
    return
  }

  $outPath = "$PayloadPath.out.json"
  if ($null -ne $payload.queries) {
    $parts = New-Object System.Collections.ArrayList
    foreach ($q in $payload.queries) {
      $nameJson = ConvertTo-Json -InputObject ([string]$q.name) -Compress
      $rowsJson = Convert-RowsToJson (Read-Table $conn $q.query $q.params)
      [void]$parts.Add(($nameJson + ':' + $rowsJson))
    }
    Write-JsonFile ('{' + ($parts -join ',') + '}') $outPath
    return
  }

  Write-JsonFile (Convert-RowsToJson (Read-Table $conn $payload.query $payload.params)) $outPath
} finally {
  $conn.Close()
}
