
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const PATH: string;
	export const GETTEXTDATADIRS: string;
	export const depsBuildTarget: string;
	export const OBJCOPY_FOR_TARGET: string;
	export const NIXPKGS_CONFIG: string;
	export const doCheck: string;
	export const NIX_BINTOOLS_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
	export const LESSKEYIN_SYSTEM: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const NIX_USER_PROFILE_DIR: string;
	export const LD_LIBRARY_PATH: string;
	export const COLORTERM: string;
	export const READELF: string;
	export const depsHostHostPropagated: string;
	export const WLR_NO_HARDWARE_CURSORS: string;
	export const NIX_BUILD_TOP: string;
	export const shellHook: string;
	export const LESSOPEN: string;
	export const patches: string;
	export const SIZE: string;
	export const IN_NIX_SHELL: string;
	export const LIBEXEC_PATH: string;
	export const AR: string;
	export const AS: string;
	export const HYPRLAND_CMD: string;
	export const __GLX_VENDOR_LIBRARY_NAME: string;
	export const STRIP: string;
	export const QT_QPA_PLATFORM: string;
	export const NIX_ENFORCE_NO_NATIVE: string;
	export const SANE_CONFIG_DIR: string;
	export const TERM: string;
	export const cmakeFlags: string;
	export const XDG_CONFIG_DIRS: string;
	export const depsTargetTarget: string;
	export const __HM_ZSH_SESS_VARS_SOURCED: string;
	export const MOCHA_COLORS: string;
	export const WAYLAND_DISPLAY: string;
	export const builder: string;
	export const LC_NAME: string;
	export const XDG_SESSION_CLASS: string;
	export const CC: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const XCURSOR_SIZE: string;
	export const AR_FOR_TARGET: string;
	export const GTK2_RC_FILES: string;
	export const propagatedNativeBuildInputs: string;
	export const ANDROID_JAVA_HOME: string;
	export const __NIXOS_SET_ENVIRONMENT_DONE: string;
	export const INVOCATION_ID: string;
	export const CXX: string;
	export const AS_FOR_TARGET: string;
	export const LC_TIME: string;
	export const NIXOS_OZONE_WL: string;
	export const CREDENTIALS_DIRECTORY: string;
	export const strictDeps: string;
	export const OBJDUMP: string;
	export const LOGNAME: string;
	export const GTK_PATH: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const INFOPATH: string;
	export const depsTargetTargetPropagated: string;
	export const LOCALE_ARCHIVE_2_27: string;
	export const SHELL: string;
	export const doInstallCheck: string;
	export const NIX_CC: string;
	export const GTK_A11Y: string;
	export const buildPhase: string;
	export const SSH_ASKPASS: string;
	export const shell: string;
	export const M2_HOME: string;
	export const __ETC_PROFILE_DONE: string;
	export const name: string;
	export const NIX_BINTOOLS: string;
	export const NODE_ENV: string;
	export const NIX_LDFLAGS: string;
	export const __structuredAttrs: string;
	export const HUSHLOGIN: string;
	export const LC_IDENTIFICATION: string;
	export const STRINGS: string;
	export const RANLIB_FOR_TARGET: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const LC_MONETARY: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu: string;
	export const XML_CATALOG_FILES: string;
	export const configureFlags: string;
	export const DEBUG_COLORS: string;
	export const XDG_SESSION_TYPE: string;
	export const NIX_BINTOOLS_FOR_TARGET: string;
	export const npm_config_color: string;
	export const DISPLAY: string;
	export const XDG_BACKEND: string;
	export const IDEA_JDK: string;
	export const OBJDUMP_FOR_TARGET: string;
	export const SIZE_FOR_TARGET: string;
	export const NIX_CFLAGS_COMPILE: string;
	export const NIX_PATH: string;
	export const GPG_TTY: string;
	export const depsBuildBuildPropagated: string;
	export const TZDIR: string;
	export const EDITOR: string;
	export const TMP: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const CXX_FOR_TARGET: string;
	export const XDG_RUNTIME_DIR: string;
	export const XDG_VTNR: string;
	export const HOME: string;
	export const XMODIFIERS: string;
	export const buildInputs: string;
	export const NIX_PROFILES: string;
	export const OBJCOPY: string;
	export const LC_PAPER: string;
	export const NIX_LDFLAGS_FOR_TARGET: string;
	export const nativeBuildInputs: string;
	export const PWD: string;
	export const stdenv: string;
	export const PAGER: string;
	export const TERMINFO: string;
	export const __HM_SESS_VARS_SOURCED: string;
	export const dontAddDisableDepTrack: string;
	export const GSETTINGS_SCHEMAS_PATH: string;
	export const system: string;
	export const SHLVL: string;
	export const LIBVA_DRIVER_NAME: string;
	export const HOST_PATH: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const JAVA_HOME: string;
	export const propagatedBuildInputs: string;
	export const XDG_DESKTOP_PORTAL_DIR: string;
	export const XDG_SESSION_ID: string;
	export const out: string;
	export const QTWEBKIT_PLUGIN_PATH: string;
	export const PKG_CONFIG_PATH_FOR_TARGET: string;
	export const CC_FOR_TARGET: string;
	export const NIX_PKG_CONFIG_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
	export const phases: string;
	export const STRIP_FOR_TARGET: string;
	export const LOCALE_ARCHIVE: string;
	export const NM_FOR_TARGET: string;
	export const STRINGS_FOR_TARGET: string;
	export const READELF_FOR_TARGET: string;
	export const LD: string;
	export const NIX_HARDENING_ENABLE: string;
	export const NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu: string;
	export const outputs: string;
	export const LC_MEASUREMENT: string;
	export const LC_TELEPHONE: string;
	export const XCURSOR_PATH: string;
	export const XDG_DATA_DIRS: string;
	export const M2: string;
	export const GIO_EXTRA_MODULES: string;
	export const GTK_IM_MODULE: string;
	export const JETBRAINSCLIENT_JDK: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const JDK_HOME: string;
	export const GBM_BACKEND: string;
	export const GDK_PIXBUF_MODULE_FILE: string;
	export const RANLIB: string;
	export const LC_ADDRESS: string;
	export const mesonFlags: string;
	export const TMPDIR: string;
	export const TEMPDIR: string;
	export const SYSTEMD_EXEC_PID: string;
	export const LS_COLORS: string;
	export const depsBuildTargetPropagated: string;
	export const depsHostHost: string;
	export const NM: string;
	export const FORCE_COLOR: string;
	export const DOCKER_HOST: string;
	export const NIX_CC_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
	export const QT_IM_MODULE: string;
	export const LD_FOR_TARGET: string;
	export const CUPS_DATADIR: string;
	export const _JAVA_AWT_WM_NOREPARENTING: string;
	export const LANG: string;
	export const IDEA_VM_OPTIONS: string;
	export const PKG_CONFIG_FOR_TARGET: string;
	export const CONFIG_SHELL: string;
	export const SOURCE_DATE_EPOCH: string;
	export const NODE_PATH: string;
	export const preferLocalBuild: string;
	export const USER: string;
	export const LC_NUMERIC: string;
	export const XDG_SEAT: string;
	export const SSH_AUTH_SOCK: string;
	export const TEMP: string;
	export const NIX_CC_FOR_TARGET: string;
	export const NIX_CFLAGS_COMPILE_FOR_TARGET: string;
	export const NIX_STORE: string;
	export const NO_AT_BRIDGE: string;
	export const NIX_GCROOT: string;
	export const depsBuildBuild: string;
	export const TERMINFO_DIRS: string;
	export const NIX_BUILD_CORES: string;
	export const VITE_HOMEPAGE_URL: string;
	export const VITE_BUGS_URL: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		PATH: string;
		GETTEXTDATADIRS: string;
		depsBuildTarget: string;
		OBJCOPY_FOR_TARGET: string;
		NIXPKGS_CONFIG: string;
		doCheck: string;
		NIX_BINTOOLS_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
		LESSKEYIN_SYSTEM: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		NIX_USER_PROFILE_DIR: string;
		LD_LIBRARY_PATH: string;
		COLORTERM: string;
		READELF: string;
		depsHostHostPropagated: string;
		WLR_NO_HARDWARE_CURSORS: string;
		NIX_BUILD_TOP: string;
		shellHook: string;
		LESSOPEN: string;
		patches: string;
		SIZE: string;
		IN_NIX_SHELL: string;
		LIBEXEC_PATH: string;
		AR: string;
		AS: string;
		HYPRLAND_CMD: string;
		__GLX_VENDOR_LIBRARY_NAME: string;
		STRIP: string;
		QT_QPA_PLATFORM: string;
		NIX_ENFORCE_NO_NATIVE: string;
		SANE_CONFIG_DIR: string;
		TERM: string;
		cmakeFlags: string;
		XDG_CONFIG_DIRS: string;
		depsTargetTarget: string;
		__HM_ZSH_SESS_VARS_SOURCED: string;
		MOCHA_COLORS: string;
		WAYLAND_DISPLAY: string;
		builder: string;
		LC_NAME: string;
		XDG_SESSION_CLASS: string;
		CC: string;
		MOZ_ENABLE_WAYLAND: string;
		XCURSOR_SIZE: string;
		AR_FOR_TARGET: string;
		GTK2_RC_FILES: string;
		propagatedNativeBuildInputs: string;
		ANDROID_JAVA_HOME: string;
		__NIXOS_SET_ENVIRONMENT_DONE: string;
		INVOCATION_ID: string;
		CXX: string;
		AS_FOR_TARGET: string;
		LC_TIME: string;
		NIXOS_OZONE_WL: string;
		CREDENTIALS_DIRECTORY: string;
		strictDeps: string;
		OBJDUMP: string;
		LOGNAME: string;
		GTK_PATH: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		INFOPATH: string;
		depsTargetTargetPropagated: string;
		LOCALE_ARCHIVE_2_27: string;
		SHELL: string;
		doInstallCheck: string;
		NIX_CC: string;
		GTK_A11Y: string;
		buildPhase: string;
		SSH_ASKPASS: string;
		shell: string;
		M2_HOME: string;
		__ETC_PROFILE_DONE: string;
		name: string;
		NIX_BINTOOLS: string;
		NODE_ENV: string;
		NIX_LDFLAGS: string;
		__structuredAttrs: string;
		HUSHLOGIN: string;
		LC_IDENTIFICATION: string;
		STRINGS: string;
		RANLIB_FOR_TARGET: string;
		MEMORY_PRESSURE_WRITE: string;
		LC_MONETARY: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		NIX_BINTOOLS_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu: string;
		XML_CATALOG_FILES: string;
		configureFlags: string;
		DEBUG_COLORS: string;
		XDG_SESSION_TYPE: string;
		NIX_BINTOOLS_FOR_TARGET: string;
		npm_config_color: string;
		DISPLAY: string;
		XDG_BACKEND: string;
		IDEA_JDK: string;
		OBJDUMP_FOR_TARGET: string;
		SIZE_FOR_TARGET: string;
		NIX_CFLAGS_COMPILE: string;
		NIX_PATH: string;
		GPG_TTY: string;
		depsBuildBuildPropagated: string;
		TZDIR: string;
		EDITOR: string;
		TMP: string;
		QT_QPA_PLATFORMTHEME: string;
		CXX_FOR_TARGET: string;
		XDG_RUNTIME_DIR: string;
		XDG_VTNR: string;
		HOME: string;
		XMODIFIERS: string;
		buildInputs: string;
		NIX_PROFILES: string;
		OBJCOPY: string;
		LC_PAPER: string;
		NIX_LDFLAGS_FOR_TARGET: string;
		nativeBuildInputs: string;
		PWD: string;
		stdenv: string;
		PAGER: string;
		TERMINFO: string;
		__HM_SESS_VARS_SOURCED: string;
		dontAddDisableDepTrack: string;
		GSETTINGS_SCHEMAS_PATH: string;
		system: string;
		SHLVL: string;
		LIBVA_DRIVER_NAME: string;
		HOST_PATH: string;
		MEMORY_PRESSURE_WATCH: string;
		JAVA_HOME: string;
		propagatedBuildInputs: string;
		XDG_DESKTOP_PORTAL_DIR: string;
		XDG_SESSION_ID: string;
		out: string;
		QTWEBKIT_PLUGIN_PATH: string;
		PKG_CONFIG_PATH_FOR_TARGET: string;
		CC_FOR_TARGET: string;
		NIX_PKG_CONFIG_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
		phases: string;
		STRIP_FOR_TARGET: string;
		LOCALE_ARCHIVE: string;
		NM_FOR_TARGET: string;
		STRINGS_FOR_TARGET: string;
		READELF_FOR_TARGET: string;
		LD: string;
		NIX_HARDENING_ENABLE: string;
		NIX_CC_WRAPPER_TARGET_HOST_x86_64_unknown_linux_gnu: string;
		outputs: string;
		LC_MEASUREMENT: string;
		LC_TELEPHONE: string;
		XCURSOR_PATH: string;
		XDG_DATA_DIRS: string;
		M2: string;
		GIO_EXTRA_MODULES: string;
		GTK_IM_MODULE: string;
		JETBRAINSCLIENT_JDK: string;
		XDG_CURRENT_DESKTOP: string;
		JDK_HOME: string;
		GBM_BACKEND: string;
		GDK_PIXBUF_MODULE_FILE: string;
		RANLIB: string;
		LC_ADDRESS: string;
		mesonFlags: string;
		TMPDIR: string;
		TEMPDIR: string;
		SYSTEMD_EXEC_PID: string;
		LS_COLORS: string;
		depsBuildTargetPropagated: string;
		depsHostHost: string;
		NM: string;
		FORCE_COLOR: string;
		DOCKER_HOST: string;
		NIX_CC_WRAPPER_TARGET_TARGET_x86_64_unknown_linux_gnu: string;
		QT_IM_MODULE: string;
		LD_FOR_TARGET: string;
		CUPS_DATADIR: string;
		_JAVA_AWT_WM_NOREPARENTING: string;
		LANG: string;
		IDEA_VM_OPTIONS: string;
		PKG_CONFIG_FOR_TARGET: string;
		CONFIG_SHELL: string;
		SOURCE_DATE_EPOCH: string;
		NODE_PATH: string;
		preferLocalBuild: string;
		USER: string;
		LC_NUMERIC: string;
		XDG_SEAT: string;
		SSH_AUTH_SOCK: string;
		TEMP: string;
		NIX_CC_FOR_TARGET: string;
		NIX_CFLAGS_COMPILE_FOR_TARGET: string;
		NIX_STORE: string;
		NO_AT_BRIDGE: string;
		NIX_GCROOT: string;
		depsBuildBuild: string;
		TERMINFO_DIRS: string;
		NIX_BUILD_CORES: string;
		VITE_HOMEPAGE_URL: string;
		VITE_BUGS_URL: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
