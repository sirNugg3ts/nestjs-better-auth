import { ConfigurableModuleBuilder } from "@nestjs/common";
import { Auth } from "./auth-module.ts";

export type AuthModuleOptions<A = Auth> = {
	auth: A;
	disableExceptionFilter?: boolean;
	disableTrustedOriginsCors?: boolean;
	disableBodyParser?: boolean;
};

export const {
	ConfigurableModuleClass,
	MODULE_OPTIONS_TOKEN,
	OPTIONS_TYPE,
	ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<AuthModuleOptions>()
	.setClassMethodName("forRoot")
	.setExtras(
		{
			isGlobal: true,
			disableExceptionFilter: false,
			disableTrustedOriginsCors: false,
			disableBodyParser: false,
		},
		(def, extras) => {
			return {
				...def,
				providers: [
					...def.providers ?? [],
				],
				global: extras.isGlobal,
			};
		},
	)
	.build();
