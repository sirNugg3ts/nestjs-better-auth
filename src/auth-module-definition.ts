import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Auth } from "./auth-module.ts";
import { APIErrorHookThrow } from "./api-error-hook-throw.ts";

export type AuthModuleOptions<A = Auth> = {
	auth: A;
	enableAPIErrorThrow?: boolean;
	disableTrustedOriginsCors?: boolean;
	disableBodyParser?: boolean;
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
				enableAPIErrorThrow: false,
				disableTrustedOriginsCors: false,
				disableBodyParser: false,
			},
			(def, extras) => {
				const providers = def.providers ?? [];

				if (extras.enableAPIErrorThrow) {
					providers.push(APIErrorHookThrow);
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
