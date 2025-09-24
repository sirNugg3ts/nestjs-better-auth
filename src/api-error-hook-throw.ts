import { AfterHook, type AuthHookContext } from "./decorators.ts";

export class APIErrorHookThrow {
	@AfterHook()
	async handle(ctx: AuthHookContext) {
		console.log("returnd", ctx.context.returned);
	}
}
