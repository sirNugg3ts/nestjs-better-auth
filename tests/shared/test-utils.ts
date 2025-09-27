import "reflect-metadata";
import { Test } from "@nestjs/testing";
import {
	Controller,
	Get,
	Module,
	UseGuards,
	Request as NestRequest,
	type INestApplication,
} from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";

// Import from local source to test this package directly
import { AuthModule, AuthGuard, Public } from "../../src/index.ts";

// Better Auth - minimal in-memory setup with anonymous sign-in and bearer token support
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { anonymous } from "better-auth/plugins/anonymous";
import { bearer } from "better-auth/plugins/bearer";

// Simple controller with one protected route and one public route
@Controller("test")
export class TestController {
	@UseGuards(AuthGuard)
	@Get("protected")
	protected(@NestRequest() req: { user?: unknown }) {
		return { user: req.user };
	}

	@Public()
	@Get("public")
	public() {
		return { ok: true };
	}
}

// Create Better Auth instance factory
export function createTestAuth() {
	return betterAuth({
		basePath: "/api/auth",
		// baseURL is set dynamically after the Nest app starts listening
		plugins: [anonymous(), bearer()],
		database: memoryAdapter({}),
	});
}

// Test app module factory
export function createTestAppModule(auth: ReturnType<typeof createTestAuth>) {
	@Module({
		imports: [AuthModule.forRoot({ auth })],
		controllers: [TestController],
	})
	class AppModule {}

	return AppModule;
}

// Factory function to create and configure a test NestJS application
export async function createTestApp() {
	const auth = createTestAuth();
	const AppModule = createTestAppModule(auth);

	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	const app = moduleRef.createNestApplication(new ExpressAdapter(), {
		bodyParser: false,
	});

	await app.init();
	// Bind to a real port so Better Auth's internal fetch calls work
	await app.listen(0);
	const url = await app.getUrl();
	// Point Better Auth API client to this test server
	// biome-ignore lint/suspicious/noExplicitAny: Better Auth internal API access
	(auth as any).options.baseURL = url;

	return { app, auth };
}

// Helper type for test app setup
export interface TestAppSetup {
	app: INestApplication;
	auth: ReturnType<typeof createTestAuth>;
}
