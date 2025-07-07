import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';

interface IamportTokenResponse {
  code: number;
  message: string;
  response: {
    access_token: string;
    expired_at: number;
    now: number;
  };
}

interface IamportCertificationResponse {
  code: number;
  message: string;
  response: {
    imp_uid: string;
    merchant_uid: string;
    pg_tid: string;
    pg_provider: string;
    name: string;
    gender: string;
    birthday: string;
    foreigner: boolean;
    phone: string;
    carrier: string;
    certified: boolean;
    certified_at: number;
    unique_key: string;
    unique_in_site: string;
    origin: string;
  };
}

export interface CertificationInfo {
  name: string;
  phone: string;
  gender: string;
  birthday: string;
  certified: boolean;
}

@Injectable()
export class IamportService {
  private readonly logger = new Logger(IamportService.name);
  private readonly httpClient: AxiosInstance;
  private readonly impKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.impKey = this.configService.get<string>('PORTONE_REST_API_KEY') || '';
    this.apiSecret =
      this.configService.get<string>('PORTONE_V2_SECRET_KEY') || '';

    this.httpClient = axios.create({
      baseURL: 'https://api.portone.io',
      timeout: 10000,
    });

    if (!this.impKey || !this.apiSecret) {
      this.logger.error('PortOne API 키가 설정되지 않았습니다.');
      throw new Error('PortOne API 키가 설정되지 않았습니다.');
    }
  }

  /**
   * PortOne V2 본인인증 정보 조회
   * @param identityVerificationId PortOne 본인인증 고유번호
   */
  async getCertification(identityVerificationId: string): Promise<CertificationInfo> {
    try {
      const response = await this.httpClient.get(
        `/identity-verifications/${identityVerificationId}`,
        {
          headers: {
            Authorization: `PortOne ${this.apiSecret}`,
          },
        },
      );

      const verification = response.data;

      // 본인인증이 완료되지 않은 경우
      if (verification.status !== 'VERIFIED') {
        throw new UnauthorizedException('본인인증이 완료되지 않았습니다.');
      }

      this.logger.log(
        `본인인증 정보 조회 성공: ${verification.verifiedCustomer?.name} (${verification.verifiedCustomer?.phoneNumber})`,
      );

      return {
        name: verification.verifiedCustomer?.name,
        phone: verification.verifiedCustomer?.phoneNumber,
        gender: verification.verifiedCustomer?.gender,
        birthday: verification.verifiedCustomer?.birthDate,
        certified: true,
      };
    } catch (error) {
      this.logger.error('본인인증 정보 조회 실패:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('본인인증 정보 조회에 실패했습니다.');
    }
  }
}
