import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onOpenUrl, getCurrent } from '@tauri-apps/plugin-deep-link';

/**
 * Handles `mydocs://<group>/<subproject>/<path>` deep links.
 *
 * The URL maps straight onto the app's `/:groupSlug/:subSlug/*` route, so we
 * just parse the three parts and navigate — Layout then selects the group and
 * subproject and opens the file. Rendered inside the Router so useNavigate works.
 *
 * Examples:
 *   mydocs://aube/aube-docs/readme.md
 *   mydocs://aube/aube-docs/docs/features/feature_abc.yml
 */
export function DeepLinkHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = (url: string) => {
      // Strip the scheme and any leading slashes, then split into segments.
      const rest = url.replace(/^mydocs:\/\//i, '').replace(/^\/+/, '');
      const [group, sub, ...pathParts] = rest.split('/').filter(Boolean);
      if (!group || !sub) return;
      const path = pathParts.join('/');
      navigate(`/${group}/${sub}${path ? `/${path}` : ''}`);
    };

    let unlisten: (() => void) | undefined;

    // URL the app was cold-started with (launched via the link).
    getCurrent()
      .then((urls) => {
        if (urls && urls.length) handle(urls[0]);
      })
      .catch(() => {});

    // URLs delivered while the app is already running.
    onOpenUrl((urls) => urls.forEach(handle))
      .then((fn) => {
        unlisten = fn;
      })
      .catch(() => {});

    return () => unlisten?.();
  }, [navigate]);

  return null;
}
