import {INestApplication, Controller, Get, UseGuards, Optional} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { Reflector } from "@nestjs/core";
import {AuthGuard} from "./auth-guard";
import {Public, Roles} from "./decorators";
import {AUTH_INSTANCE_KEY} from "./symbols";

// Fake auth instance
const mockAuth = {
    api: {
        getSession: jest.fn(),
    },
};

@Controller()
@UseGuards(AuthGuard)
class TestController {
    @Get("public")
    @Public()
    getPublic() {
        return { data: "public ok" };
    }

    @Get("optional")
    @Optional()
    getOptional() {
        return { data: "optional ok" };
    }

    @Get("protected")
    getProtected() {
        return { data: "protected ok" };
    }

    @Get("admin")
    @Roles(["admin"])
    getAdmin() {
        return { data: "admin ok" };
    }
}

describe("AuthGuard E2E", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [TestController],
            providers: [
                Reflector,
                { provide: AUTH_INSTANCE_KEY, useValue: mockAuth },
                AuthGuard,
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("✅ allows access to public route without session", async () => {
        mockAuth.api.getSession.mockResolvedValue(null);
        await request(app.getHttpServer())
            .get("/public")
            .expect(200)
            .expect({ data: "public ok" });
    });

    it("✅ allows access to optional route without session", async () => {
        mockAuth.api.getSession.mockResolvedValue(null);
        await request(app.getHttpServer())
            .get("/optional")
            .expect(200)
            .expect({ data: "optional ok" });
    });

    it("❌ blocks protected route without session", async () => {
        mockAuth.api.getSession.mockResolvedValue(null);
        await request(app.getHttpServer())
            .get("/protected")
            .expect(401)
            .expect((res) => {
                expect(res.body.message).toBe("Unauthorized");
            });
    });

    it("✅ allows protected route with session", async () => {
        mockAuth.api.getSession.mockResolvedValue({
            user: { id: "u1", role: "user" },
        });
        await request(app.getHttpServer())
            .get("/protected")
            .expect(200)
            .expect({ data: "protected ok" });
    });

    it("❌ blocks admin route with insufficient role", async () => {
        mockAuth.api.getSession.mockResolvedValue({
            user: { id: "u1", role: "user" },
        });
        await request(app.getHttpServer())
            .get("/admin")
            .expect(403)
            .expect((res) => {
                expect(res.body.message).toContain("insufficient permissions");
            });
    });

    it("✅ allows admin route with correct role", async () => {
        mockAuth.api.getSession.mockResolvedValue({
            user: { id: "u1", role: "admin" },
        });
        await request(app.getHttpServer())
            .get("/admin")
            .expect(200)
            .expect({ data: "admin ok" });
    });

    it("✅ allows admin route with role array containing admin", async () => {
        mockAuth.api.getSession.mockResolvedValue({
            user: { id: "u1", role: ["editor", "admin"] },
        });
        await request(app.getHttpServer())
            .get("/admin")
            .expect(200)
            .expect({ data: "admin ok" });
    });
});
