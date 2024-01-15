interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  /**
   * Built-in environment variable.
   * @see Docs https://github.com/chihab/ngx-env#ng_app_env.
   */
  readonly NG_APP_ENV: string;
  // Add your environment variables below
  // readonly NG_APP_API_URL: string;
  [key: string]: any;
  readonly NG_APP_SECRET : string;
  readonly NG_APP_API_URL : string;
  readonly NG_APP_IV: string;
  readonly NG_APP_XTEA_KEY: string;
}
