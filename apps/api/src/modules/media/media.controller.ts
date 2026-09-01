import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl(
    @Body()
    body: {
      fileName: string;
      mimeType: string;
      fileSizeBytes?: number;
      category?: 'VISIT_PHOTO' | 'AUDIO_NOTE' | 'IDENTITY_DOC' | 'PRESCRIPTION';
    },
  ) {
    return this.mediaService.generatePresignedUploadUrl(body);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(@Body() body: { key: string }) {
    return this.mediaService.confirmUpload(body.key);
  }
}
