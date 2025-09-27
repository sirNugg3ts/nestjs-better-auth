import request from "supertest";
import { faker } from "@faker-js/faker";
import { createTestApp, type TestAppSetup } from "../shared/test-utils.ts";

describe("rest auth e2e", () => {
	let testSetup: TestAppSetup;

	beforeAll(async () => {
		testSetup = await createTestApp();
	});

	afterAll(async () => {
		await testSetup.app.close();
	});

	it("should not be able to access protected route without auth", async () => {
		await request(testSetup.app.getHttpServer())
			.get("/test/protected")
			.expect(401)
			.expect((res) => {
				expect(res.body?.message).toBeDefined();
			});
	});

	it("should be able to access public route without auth", async () => {
		const response = await request(testSetup.app.getHttpServer())
			.get("/test/public")
			.expect(200);

		expect(response.body).toMatchObject({
			ok: true,
		});
	});

	it("should be able to access an optional protected route without auth", async () => {
		const response = await request(testSetup.app.getHttpServer())
			.get("/test/optional")
			.expect(200);

		expect(response.body).toMatchObject({
			authenticated: false,
		});
	});

	it("should be able to access an optional protected route with auth", async () => {
		const signUp = await testSetup.auth.api.signUpEmail({
			body: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password({ length: 10 }),
			},
		});

		const response = await request(testSetup.app.getHttpServer())
			.get("/test/optional")
			.set("Authorization", `Bearer ${signUp.token}`)
			.expect(200);

		expect(response.body).toMatchObject({
			authenticated: true,
			session: expect.objectContaining({
				user: expect.objectContaining({
					id: signUp.user.id,
					name: signUp.user.name,
					email: signUp.user.email,
				}),
			}),
		});
	});

	it("should be able to sign up and authenticate", async () => {
		const signUp = await testSetup.auth.api.signUpEmail({
			body: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: faker.internet.password({ length: 10 }),
			},
		});

		const token = signUp.token;

		const response = await request(testSetup.app.getHttpServer())
			.get("/test/protected")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(response.body).toMatchObject({
			user: expect.objectContaining({
				id: signUp.user.id,
				name: signUp.user.name,
				email: signUp.user.email,
			}),
		});
	});
});
