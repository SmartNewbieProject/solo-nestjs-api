import { Length } from "class-validator";

export class NameUpdated {
  @Length(3, 15, {
    message: '닉네임은 3자 이상 15자 이하여야 합니다.',
  })
  nickname: string;
}
