import { Resolver, Query, ObjectType, Field } from "@nestjs/graphql";
import { AllowAnonymous } from "../../src/decorators.ts";
import { OptionalAuth } from "../../src/decorators.ts";
import { Session } from "../../src/decorators.ts";
import type { UserSession } from "../../src/auth-guard.ts";

@ObjectType()
class ProtectedUserIdResult {
	@Field({ nullable: true })
	userId?: string;
}

@ObjectType()
class OptionalAuthenticatedResult {
	@Field()
	authenticated!: boolean;

	@Field(() => String, { nullable: true })
	userId?: string;
}

@Resolver()
export class TestResolver {
	@AllowAnonymous()
	@Query(() => String)
	publicHello(): string {
		return "ok";
	}

	@OptionalAuth()
	@Query(() => OptionalAuthenticatedResult)
	optionalAuthenticated(@Session() session: UserSession) {
		return {
			authenticated: !!session,
			userId: session?.user?.id,
		};
	}

	@Query(() => ProtectedUserIdResult)
	protectedUserId(@Session() session: UserSession) {
		return {
			userId: session?.user?.id,
		};
	}
}
