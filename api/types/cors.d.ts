declare module "cors" {
  export interface CorsOptions {
    origin?: any;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  const cors: (options?: CorsOptions) => any;
  export default cors;
}
