import { APIError } from "better-auth/api";
import { AfterHook, Hook, type AuthHookContext } from "./decorators.ts";

@Hook()
export class APIErrorHookThrow {
	@AfterHook()
	async handle(ctx: AuthHookContext) {
		// better-auth will not throw APIError and instead will try to handle it by itself
		if (ctx.context.returned instanceof APIError) throw ctx.context.returned;
	}
}
