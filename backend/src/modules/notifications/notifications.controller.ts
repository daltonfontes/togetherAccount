import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  async list(@CurrentUser('id') userId: string, @Query() query: PaginationQueryDto) {
    return this.notificationsService.findForUser(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count unread notifications' })
  async unreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.countUnread(userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.notificationsService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.notificationsService.remove(userId, id);
  }
}
