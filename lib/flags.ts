
import { dedupe, flag } from 'flags/next';
import type { Identify } from 'flags';
import { growthbookAdapter, type Attributes } from '@flags-sdk/growthbook';
import { cookies, headers } from 'next/headers';

// Add any user attributes you want to use for targeting or experimentation
const identify = dedupe((async () => {
    const cookieStore = await cookies();
    const headersList = await headers();
    return {
        id: cookieStore.get('user_id')?.value,
        userAgent: headersList.get('user-agent') || undefined,
    };
}) satisfies Identify<Attributes>);

// Export each feature flag you want to use:
export const exampleFlag = flag({
    key: 'example_flag',
    identify,
    adapter: growthbookAdapter.feature<boolean>(),
    defaultValue: false,
});

export const vectorScoringEnabled = flag({
    key: 'vector_scoring_enabled',
    identify,
    adapter: growthbookAdapter.feature<boolean>(),
    defaultValue: true,
});
