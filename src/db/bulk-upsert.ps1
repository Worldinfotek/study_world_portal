param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadPath
)

$ErrorActionPreference = 'Stop'
$payload = Get-Content -Raw -Encoding UTF8 -Path $PayloadPath | ConvertFrom-Json
$conn = New-Object System.Data.SqlClient.SqlConnection $payload.connectionString
$conn.Open()
try {
  foreach ($item in $payload.records) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = [string]$item.sql
    if ($null -ne $item.params) {
      foreach ($p in $item.params.PSObject.Properties) {
        $val = $p.Value
        if ($null -eq $val) { $val = [DBNull]::Value }
        [void]$cmd.Parameters.AddWithValue('@' + $p.Name, $val)
      }
    }
    [void]$cmd.ExecuteNonQuery()
  }
  @{ ok = $true; count = @($payload.records).Count } | ConvertTo-Json -Compress
} finally {
  $conn.Close()
}
