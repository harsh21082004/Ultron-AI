import { createFeatureSelector } from '@ngrx/store';
import { getRouterSelectors, RouterReducerState } from '@ngrx/router-store';

// This is the key for the router state in your main AppState.
// It must match the key you will use in your root reducer map.
export const selectRouter = createFeatureSelector<RouterReducerState>('router');

// The getSelectors function from @ngrx/router-store provides a collection of
// powerful, pre-built selectors for accessing router state.
export const {
  selectCurrentRoute,   // select the current route object
  selectFragment,       // select the current URL fragment
  selectQueryParams,    // select the current query parameters
  selectQueryParam,     // factory to select a specific query parameter
  selectRouteParams,    // select the current route parameters (e.g., { id: 'some-id' })
  selectRouteParam,     // factory to select a specific route parameter (this is the one you need)
  selectRouteData,      // select the current route's data property
  selectUrl,            // select the current URL string
} = getRouterSelectors(selectRouter);
