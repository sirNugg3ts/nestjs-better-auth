import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import request from "supertest";

// Import shared test utilities
import { createTestApp, type TestAppSetup } from "../shared/test-utils.ts";

describe("basic auth e2e", () => {
	let testSetup: TestAppSetup;

	beforeAll(async () => {
		testSetup = await createTestApp();
	});

	afterAll(async () => {
		await testSetup.app.close();
	});

	it("should reject protected route without auth", async () => {
		await request(testSetup.app.getHttpServer())
			.get("/test/protected")
			.expect(401)
			.expect((res) => {
				expect(res.body?.message).toBeDefined();
			});
	});

	it("should authenticate with valid bearer token", async () => {
		// 1) Create an anonymous session via Better Auth API
		const signIn = await request(testSetup.app.getHttpServer())
			.post("/api/auth/sign-in/anonymous")
			.expect(200);

		const token = signIn.body?.token;
		expect(typeof token).toBe("string");

		// 2) Access protected route with Authorization header
		await request(testSetup.app.getHttpServer())
			.get("/test/protected")
			.set("Authorization", `Bearer ${token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body?.user?.id).toBeDefined();
			});
	});
});
