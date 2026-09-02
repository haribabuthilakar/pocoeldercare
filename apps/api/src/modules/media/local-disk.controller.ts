import { Controller, Put, Get, Param, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('test/media')
export class LocalDiskController {
  @Put('upload/*')
  async handleLocalUpload(@Req() req: Request, @Res() res: Response) {
    // Mock local disk upload receiver for test & dev environments
    return res.status(HttpStatus.OK).json({ success: true, message: 'File written to test storage' });
  }

  @Get('files/*')
  async serveLocalFile(@Param() params: any, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(Buffer.from('mock-file-content'));
  }
}
