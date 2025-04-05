import { IsNotEmpty, IsString, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { getUniversities, getDepartmentsByUniversity, getStudentIds, getGrades } from '../domain/university';

@ValidatorConstraint({ name: 'isValidUniversity', async: false })
export class IsValidUniversityConstraint implements ValidatorConstraintInterface {
  validate(universityName: string, args: ValidationArguments) {
    const universities = getUniversities();
    return universities.includes(universityName);
  }

  defaultMessage(args: ValidationArguments) {
    return `대학 이름이 유효하지 않습니다. 유효한 대학 이름: ${getUniversities().join(', ')}`;
  }
}

@ValidatorConstraint({ name: 'isValidDepartment', async: false })
export class IsValidDepartmentConstraint implements ValidatorConstraintInterface {
  validate(department: string, args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    
    if (!universityName) return false;
    
    const departments = getDepartmentsByUniversity(universityName);
    return departments.includes(department);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    const departments = getDepartmentsByUniversity(universityName);
    
    return `학과가 유효하지 않습니다. ${universityName}의 유효한 학과: ${departments.join(', ')}`;
  }
}

@ValidatorConstraint({ name: 'isValidStudentNumber', async: false })
export class IsValidStudentNumberConstraint implements ValidatorConstraintInterface {
  validate(studentNumber: string, args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    
    if (!universityName) return false;
    
    const studentNumbers = getStudentIds();
    return studentNumbers.includes(studentNumber);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    const studentNumbers = getStudentIds();
    
    return `학번이 유효하지 않습니다. ${universityName}의 유효한 학번: ${studentNumbers.join(', ')}`;
  }
}

@ValidatorConstraint({ name: 'isValidGrade', async: false })
export class IsValidGradeConstraint implements ValidatorConstraintInterface {
  validate(grade: string, args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    
    if (!universityName) return false;
    
    const grades = getGrades();
    return grades.includes(grade);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as UniversityRegister;
    const universityName = object.universityName;
    const grades = getGrades();
    
    return `학년이 유효하지 않습니다. ${universityName}의 유효한 학년: ${grades.join(', ')}`;
  }
}

export class UniversityRegister {
  @ApiProperty({
    description: '대학 이름',
    example: '한밭대학교'
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidUniversityConstraint)
  universityName: string;

  @ApiProperty({
    description: '학과 이름',
    example: '컴퓨터공학과'
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidDepartmentConstraint)
  department: string;

  @ApiProperty({
    description: '학번',
    example: '19학번'
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsValidStudentNumberConstraint)
  studentNumber: string;

  @ApiProperty({
    description: '학년',
    example: '4학년'
  })
  @IsString()       
  @IsNotEmpty()
  @Validate(IsValidGradeConstraint)
  grade: string;
}
