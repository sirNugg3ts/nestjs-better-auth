import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Auth } from "./auth-module.ts";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth-guard.ts";

export type AuthModuleOptions<A = Auth> = {
	auth: A;
	disableTrustedOriginsCors?: boolean;
	disableBodyParser?: boolean;
	disableGlobalAuthGuard?: boolean;
};

export const MODULE_OPTIONS_TOKEN = Symbol("AUTH_MODULE_OPTIONS");

export const { ConfigurableModuleClass, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
	new ConfigurableModuleBuilder<AuthModuleOptions>({
		optionsInjectionToken: MODULE_OPTIONS_TOKEN,
	})
		.setClassMethodName("forRoot")
		.setExtras(
			{
				isGlobal: true,
				disableTrustedOriginsCors: false,
				disableBodyParser: false,
				disableGlobalAuthGuard: false,
			},
			(def, extras) => {
				const providers = def.providers ?? [];

				if (!extras.disableGlobalAuthGuard) {
					providers.push({
						provide: APP_GUARD,
						useClass: AuthGuard,
					});
				}

				return {
					...def,
					exports: [MODULE_OPTIONS_TOKEN],
					providers,
					global: extras.isGlobal,
				};
			},
		)
		.build();
