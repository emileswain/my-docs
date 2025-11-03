# React Best Practices

## Component Patterns
- Use functional components exclusively
- Co-locate component files: `Button.tsx`, `Button.test.tsx`, `Button.module.css`
- Keep components under 200 lines; split if larger

## State Management
- Use `useState` for local component state
- Use `useContext` for shared state within feature modules
- Use Zustand for global application state (store in `src/stores/`)

## Data Fetching
- Use React Query for all API calls
- Query keys follow pattern: `['resource', id, filters]`
- Mutations should invalidate related queries
- Example:
  ```typescript
  const { data } = useQuery(['users', userId], () => fetchUser(userId))
  ```

## Styling
- Use CSS modules (`.module.css` extension)
- Prefix utility classes with `u-` (e.g., `u-mt-4`)
- Prefix component-specific classes with component name (e.g., `button-primary`)
- Use TailwindCSS utility classes for spacing and layout
- Custom styles only for complex components

## Error Handling
- Always provide user-friendly error messages
- Log errors to console in development
- Use Error Boundary components for component tree errors
- Network errors should display retry option

## Performance
- Memoize expensive calculations with `useMemo`
- Memoize callbacks passed to children with `useCallback`
- Lazy load route components with `React.lazy()`
- Use virtual scrolling for lists over 100 items
