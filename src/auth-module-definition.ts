import { ConfigurableModuleBuilder } from "@nestjs/common";
import type { Auth } from "./auth-module.ts";
import { APP_FILTER } from "@nestjs/core";
import { APIErrorExceptionFilter } from "./api-error-exception-filter.ts";

export type AuthModuleOptions<A = Auth> = {
	auth: A;
	disableExceptionFilter?: boolean;
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
				disableExceptionFilter: false,
				disableTrustedOriginsCors: false,
				disableBodyParser: false,
			},
			(def, extras) => {
				const providers = def.providers ?? [];

				providers.push({
					provide: APP_FILTER,
					useClass: APIErrorExceptionFilter,
				});

				return {
					...def,
					exports: [MODULE_OPTIONS_TOKEN],
					providers,
					global: extras.isGlobal,
				};
			},
		)
		.build();
