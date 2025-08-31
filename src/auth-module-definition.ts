import { ConfigurableModuleBuilder } from "@nestjs/common";
import { AUTH_INSTANCE_KEY } from "./symbols.ts";

export type AuthModuleOptions<A = any> = {
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
					...def.providers,
					{
						provide: AUTH_INSTANCE_KEY,
						useValue: {},
					},
				],
				global: extras.isGlobal,
			};
		},
	)
	.build();
