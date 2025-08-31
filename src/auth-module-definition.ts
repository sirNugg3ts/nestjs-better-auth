import { ConfigurableModuleBuilder } from "@nestjs/common";

export type AuthModuleOptions = {
	auth: any;
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
				global: extras.isGlobal,
			};
		},
	)
	.build();
