import type { AttributifyAttributes } from '@unocss/preset-attributify';

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes {
      leading?: string;
      top?: string;
      'translate-y'?: string;
      duration?: string;
      whitespace?: string;
      right?: string;
    }
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOT_CALCULATOR?: string;
  readonly PUBLIC_ADSENSE_SLOT_TOOL?: string;
  readonly PUBLIC_ADSENSE_SLOT_HOME_MID?: string;
  readonly PUBLIC_ADSENSE_SLOT_LIST_MID?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly RESEND_API_KEY?: string;
  readonly RESEND_FROM_EMAIL?: string;
  readonly RESEND_FROM_NAME?: string;
  readonly ADMIN_EMAIL?: string;
}
