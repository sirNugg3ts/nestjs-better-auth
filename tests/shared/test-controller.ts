import { Controller, Get, Request } from "@nestjs/common";
import { Public, Optional } from "../../src/decorators.ts";
import type { UserSession } from "../../src/auth-guard.ts";

// Simple controller with one protected route and one public route
@Controller("test")
export class TestController {
	@Get("protected")
	protected(@Request() req: { user?: unknown }) {
		return { user: req.user };
	}

	@Public()
	@Get("public")
	public() {
		return { ok: true };
	}

	@Optional()
	@Get("optional")
	optional(@Request() req: UserSession) {
		return { authenticated: !!req.user, session: req.session };
	}
}
