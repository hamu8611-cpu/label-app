import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;

  // AuthService のモック（偽物）
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    validateCardUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      // JwtAuthGuard をテスト用に上書き（常に通過させる）
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('ログイン中のユーザー情報を取得できること', () => {
      it('should return user info', () => {
        // 必要なプロパティだけを持つ型として定義
        const mockReq = {
          user: { username: '管理者' },
        } as { user: { username: string } };

        // 使うときに any にキャストして渡す（代入時ではないので警告されません）
        const result = controller.getMe(mockReq as any);

        expect(result.Tname).toBe('管理者');
      });
    });
  });
});
