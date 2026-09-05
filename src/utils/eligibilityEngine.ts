import {
  Course,
  StudentProfile,
  EligibilityEvaluationResult,
  EligibilityVerdict,
  University,
} from '../types';

export function evaluateEligibility(
  student: StudentProfile,
  course: Course,
  university?: University
): EligibilityEvaluationResult {
  const req = course.eligibility;
  const breakdown: EligibilityEvaluationResult['breakdown'] = {
    nationality: { passed: true, message: 'Nationality verified eligible.', isHard: true },
    qualification: { passed: true, message: 'Meets qualification level requirement.', isHard: true },
    academic_score: { passed: true, message: 'Academic score meets threshold.', isHard: true, partial: false },
    study_gap: { passed: true, message: 'Study gap is within permissible limits.', isHard: true },
    english_proficiency: { passed: true, message: 'English language requirements satisfied.', isHard: true, partial: false },
    age: { passed: true, message: 'Age satisfies course entry criteria.', isHard: true },
  };

  const failedHardReasons: string[] = [];
  const warnings: string[] = [];
  const positives: string[] = [];

  // 1. Check Nationality restrictions & eligibility
  if (student.nationality) {
    const studentNat = student.nationality.trim().toLowerCase();
    const isRestricted = req.restricted_nationalities?.some(
      (n) => n.trim().toLowerCase() === studentNat
    );

    if (isRestricted) {
      breakdown.nationality.passed = false;
      const msg = `Nationality (${student.nationality}) is currently restricted for this program.`;
      breakdown.nationality.message = msg;
      failedHardReasons.push(msg);
    } else if (
      req.eligible_nationalities &&
      req.eligible_nationalities.length > 0 &&
      !req.eligible_nationalities.includes('All')
    ) {
      const isEligible = req.eligible_nationalities.some(
        (n) => n.trim().toLowerCase() === studentNat
      );
      if (!isEligible) {
        breakdown.nationality.passed = false;
        const msg = `Course only accepts specific nationalities: ${req.eligible_nationalities.join(', ')}.`;
        breakdown.nationality.message = msg;
        failedHardReasons.push(msg);
      } else {
        positives.push(`Nationality (${student.nationality}) is explicitly accepted.`);
      }
    } else {
      positives.push(`Nationality (${student.nationality}) is eligible (open to all).`);
    }
  }

  // 2. Check Minimum Qualification Level (Ranked)
  if (student.previous_qualification_rank !== undefined && student.previous_qualification_rank !== null) {
    if (student.previous_qualification_rank < req.minimum_qualification_rank) {
      breakdown.qualification.passed = false;
      const msg = `Requires at least "${req.minimum_qualification}", but student holds "${student.previous_qualification}".`;
      breakdown.qualification.message = msg;
      failedHardReasons.push(msg);
    } else {
      positives.push(`Academic background (${student.previous_qualification}) meets or exceeds required entry level (${req.minimum_qualification}).`);
    }
  } else if (!student.previous_qualification) {
    warnings.push('Previous academic qualification not specified.');
  }

  // 3. Check Minimum Percentage / CGPA
  let scoreChecked = false;
  let scorePassed = true;

  if (req.minimum_percentage !== undefined && req.minimum_percentage > 0) {
    if (student.percentage !== undefined && student.percentage > 0) {
      scoreChecked = true;
      if (student.percentage < req.minimum_percentage) {
        scorePassed = false;
        const msg = `Academic score ${student.percentage}% is below required ${req.minimum_percentage}%.`;
        breakdown.academic_score.message = msg;
        failedHardReasons.push(msg);
      } else {
        positives.push(`Academic score ${student.percentage}% meets required ${req.minimum_percentage}%.`);
      }
    }
  }

  if (req.minimum_cgpa !== undefined && req.minimum_cgpa > 0) {
    if (student.cgpa !== undefined && student.cgpa > 0) {
      scoreChecked = true;
      if (student.cgpa < req.minimum_cgpa) {
        scorePassed = false;
        const msg = `CGPA ${student.cgpa.toFixed(2)} is below required ${req.minimum_cgpa.toFixed(2)}.`;
        breakdown.academic_score.message = msg;
        failedHardReasons.push(msg);
      } else {
        positives.push(`CGPA ${student.cgpa.toFixed(2)} meets required ${req.minimum_cgpa.toFixed(2)}.`);
      }
    }
  }

  if (!scoreChecked) {
    breakdown.academic_score.partial = true;
    breakdown.academic_score.message = `Minimum requirement is ${req.minimum_percentage ? `${req.minimum_percentage}%` : ''} ${req.minimum_cgpa ? `or ${req.minimum_cgpa} CGPA` : ''}. Student percentage/CGPA not entered.`;
    warnings.push('Academic percentage or CGPA was not provided for evaluation.');
  } else {
    breakdown.academic_score.passed = scorePassed;
  }

  // 4. Check Study Gap
  if (student.study_gap !== undefined && student.study_gap !== null) {
    if (student.study_gap > req.study_gap_allowed_years) {
      breakdown.study_gap.passed = false;
      const msg = `Study gap of ${student.study_gap} years exceeds max permissible limit of ${req.study_gap_allowed_years} years.`;
      breakdown.study_gap.message = msg;
      failedHardReasons.push(msg);
    } else {
      positives.push(`Study gap (${student.study_gap} yrs) is within allowed limit of ${req.study_gap_allowed_years} yrs.`);
    }
  }

  // 5. English Proficiency (a pass on ANY one of IELTS/PTE/TOEFL/MOI that the course accepts is sufficient)
  let passedAnyEnglish = false;
  let englishTestAttempted = false;
  const englishDetails: string[] = [];

  // Check IELTS
  if (student.ielts_overall !== undefined && student.ielts_overall > 0) {
    englishTestAttempted = true;
    const bandOk = student.ielts_min_band !== undefined ? student.ielts_min_band >= req.ielts_min_band : true;
    if (student.ielts_overall >= req.ielts_overall && bandOk) {
      passedAnyEnglish = true;
      englishDetails.push(`IELTS score ${student.ielts_overall} meets course min ${req.ielts_overall} (bands >= ${req.ielts_min_band}).`);
    } else {
      englishDetails.push(`IELTS ${student.ielts_overall} is below requirement (${req.ielts_overall} overall, min ${req.ielts_min_band} band).`);
    }
  }

  // Check PTE
  if (!passedAnyEnglish && student.pte_score !== undefined && student.pte_score > 0) {
    englishTestAttempted = true;
    if (student.pte_score >= req.pte_min) {
      passedAnyEnglish = true;
      englishDetails.push(`PTE score ${student.pte_score} meets course min ${req.pte_min}.`);
    } else {
      englishDetails.push(`PTE ${student.pte_score} is below requirement (${req.pte_min}).`);
    }
  }

  // Check TOEFL
  if (!passedAnyEnglish && student.toefl_score !== undefined && student.toefl_score > 0) {
    englishTestAttempted = true;
    if (student.toefl_score >= req.toefl_min) {
      passedAnyEnglish = true;
      englishDetails.push(`TOEFL score ${student.toefl_score} meets course min ${req.toefl_min}.`);
    } else {
      englishDetails.push(`TOEFL ${student.toefl_score} is below requirement (${req.toefl_min}).`);
    }
  }

  // Check Medium of Instruction (MOI)
  if (!passedAnyEnglish && student.moi_available) {
    if (req.moi_acceptance === 'Accepted') {
      passedAnyEnglish = true;
      englishDetails.push('Medium of Instruction (MOI) letter is fully accepted for English waiver.');
    } else if (req.moi_acceptance === 'Case-by-Case') {
      englishDetails.push('MOI letter is considered Case-by-Case upon submission of prior syllabus/degree.');
    } else {
      englishDetails.push('MOI is NOT accepted by this university/course — official English test score required.');
    }
  }

  if (passedAnyEnglish) {
    breakdown.english_proficiency.passed = true;
    breakdown.english_proficiency.message = englishDetails.join(' ');
    positives.push(breakdown.english_proficiency.message);
  } else if (!englishTestAttempted && !student.moi_available) {
    // Missing test data -> Possibly eligible / manual review
    breakdown.english_proficiency.passed = true;
    breakdown.english_proficiency.partial = true;
    breakdown.english_proficiency.message = `No English test score or MOI provided. Course requires IELTS ${req.ielts_overall}, PTE ${req.pte_min}, or TOEFL ${req.toefl_min}.`;
    warnings.push('English proficiency proof (IELTS/PTE/TOEFL/MOI) missing; requires verification or test booking.');
  } else {
    // Attempted tests / MOI provided but did not satisfy
    if (student.moi_available && req.moi_acceptance === 'Case-by-Case') {
      breakdown.english_proficiency.passed = true;
      breakdown.english_proficiency.partial = true;
      breakdown.english_proficiency.message = 'MOI is accepted on Case-by-Case basis. Conditional offer or interview may apply.';
      warnings.push('MOI accepted conditionally on Case-by-Case assessment.');
    } else {
      breakdown.english_proficiency.passed = false;
      const msg = `English requirement not met: Course needs IELTS ${req.ielts_overall} (min ${req.ielts_min_band}) or PTE ${req.pte_min} or TOEFL ${req.toefl_min}. ${englishDetails.join(' ')}`;
      breakdown.english_proficiency.message = msg;
      failedHardReasons.push(msg);
    }
  }

  // 6. Check Minimum Age (and optional max age)
  if (student.age !== undefined && student.age > 0) {
    if (student.age < req.age_requirement_min) {
      breakdown.age.passed = false;
      const msg = `Student age (${student.age}) is under the minimum entry age requirement (${req.age_requirement_min} years).`;
      breakdown.age.message = msg;
      failedHardReasons.push(msg);
    } else if (req.age_requirement_max && student.age > req.age_requirement_max) {
      breakdown.age.passed = false;
      const msg = `Student age (${student.age}) exceeds maximum specified program age (${req.age_requirement_max} years).`;
      breakdown.age.message = msg;
      failedHardReasons.push(msg);
    } else {
      positives.push(`Age (${student.age} yrs) complies with entry age criteria.`);
    }
  }

  // Determine Verdict
  let verdict: EligibilityVerdict = 'Eligible';
  if (failedHardReasons.length > 0) {
    verdict = 'Not Eligible';
  } else if (warnings.length > 0) {
    verdict = 'Possibly Eligible';
  } else {
    verdict = 'Eligible';
  }

  // Calculate Match Score (0 - 100)
  let score = 100;
  if (verdict === 'Not Eligible') {
    score = Math.max(10, 60 - failedHardReasons.length * 20);
  } else if (verdict === 'Possibly Eligible') {
    score = Math.max(65, 88 - warnings.length * 8);
  } else {
    score = 95 + (positives.length > 3 ? 5 : 0);
  }

  // Check financial budget fit if provided
  let financial_fit: EligibilityEvaluationResult['financial_fit'] = 'Budget Not Set';
  if (student.max_tuition_budget && student.max_tuition_budget > 0) {
    if (course.tuition_fee <= student.max_tuition_budget) {
      financial_fit = 'Within Budget';
    } else {
      financial_fit = 'Exceeds Budget';
    }
  }

  return {
    course_id: course.course_id,
    course,
    university,
    verdict,
    overall_score: score,
    breakdown,
    reasons: failedHardReasons,
    positives,
    missing_data_warnings: warnings,
    financial_fit,
  };
}
