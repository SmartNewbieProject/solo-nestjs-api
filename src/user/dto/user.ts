import { IsString, Length, MinLength, Matches } from "class-validator";

export class NameUpdated {
  @Length(3, 15, {
    message: '닉네임은 3자 이상 15자 이하여야 합니다.',
  })
  nickname: string;
}

export class PasswordUpdated {
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W_]{8,}$/, {
    message: '비밀번호는 최소 8자 이상이며, 문자와 숫자, 특수문자를 포함해야 합니다.',
  })
  oldPassword: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W_]{8,}$/, {
    message: '비밀번호는 최소 8자 이상이며, 문자와 숫자, 특수문자를 포함해야 합니다.',
  })
  newPassword: string;
}

export class WithdrawRequest {
  @IsString()
  reason: string;
}
