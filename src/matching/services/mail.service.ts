import { MailService } from "@/common/services/mail.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MatchingEmailService {
  constructor(private readonly mailService: MailService) {}

  async sendMatchingAlertEmail(to: string, name: string) {
    return this.mailService.sendMatchingAlertEmail(to, name);
  }
}
