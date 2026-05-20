Backend Concepts

Concept Name: Express application setup with ES Modules
Where used: server.js, package.json
Purpose: Create the HTTP server, register middleware, mount APIs, and start listening on a port.
How it works: The app uses import/export syntax (type module), creates an Express instance, wires middleware and routes, then calls listen.
Syntax overview:
Function names: express(), app.use(), app.get(), app.listen()
Parameters taken: route prefixes, middleware functions, handlers, port number, callback
Return values: Express app instance, response objects from handlers
Real-world analogy: A building lobby desk that routes all visitors to the right floor.
Best practices or improvements: Add startup validation for required env keys before app.listen so the app fails early with clear errors.

Concept Name: Modular routing with express.Router
Where used: commonApi.js, usersApi.js, postsApi.js, commentsApi.js, server.js
Purpose: Separate domain APIs (auth/users/posts/comments) into focused modules.
How it works: Each module exports a router, then server mounts each router under /api prefixes.
Syntax overview:
Function names: express.Router(), router.get(), router.post(), router.put(), router.patch()
Parameters taken: path string, optional middleware chain, async handler
Return values: Router instance and JSON HTTP responses
Real-world analogy: Different counters in one office for passport, billing, and records.
Best practices or improvements: Add a versioned prefix like /api/v1 to support future API evolution safely.

Concept Name: Controller pattern implemented inline in route handlers
Where used: usersApi.js, postsApi.js, commentsApi.js, commonApi.js
Purpose: Handle request validation, call data layer, and shape response per endpoint.
How it works: Instead of separate controller files, each router file contains async handlers (effectively controllers).
Syntax overview:
Function names: async (req, res, next) => { ... } handlers in each route
Parameters taken: req, res, next
Return values: res.status(...).json(...) payloads; errors forwarded via next(err)
Real-world analogy: One staff member both receives forms and processes them immediately.
Best practices or improvements: Consider extracting heavy handlers into controller modules to reduce router file size as project grows.

Concept Name: Middleware pipeline (global and route-specific)
Where used: server.js, authMiddleware.js, errorHandler.js, uploadMiddleware.js
Purpose: Apply reusable cross-cutting logic like auth, parsing, CORS, uploads, and centralized error handling.
How it works: Global middleware runs in order; route-level middleware like protect and upload.single runs only on matched endpoints.
Syntax overview:
Function names: app.use(), protect(req,res,next), errorHandler(err,req,res,next), upload.single(fieldName)
Parameters taken: request context and next function; upload field key image
Return values: next() continuation or immediate HTTP response
Real-world analogy: Security gate, baggage scanner, and final complaint desk in an airport flow.
Best practices or improvements: Add request logging middleware (with requestId) for observability and debugging.

Concept Name: CORS configuration
Where used: server.js
Purpose: Allow browser frontend origin to call backend APIs safely.
How it works: cors middleware allows origin from CORS_ORIGIN or localhost fallback.
Syntax overview:
Function names: cors({ origin })
Parameters taken: origin string from env
Return values: middleware function
Real-world analogy: Guest list at a private event.
Best practices or improvements: Add allowed methods and credentials explicitly if cookie auth is introduced later.

Concept Name: Body parsing and static file serving
Where used: server.js
Purpose: Parse JSON/form payloads and expose uploaded files over HTTP.
How it works: express.json parses JSON, express.urlencoded parses form bodies, express.static serves uploads directory under /uploads.
Syntax overview:
Function names: express.json(), express.urlencoded({ extended: true }), express.static(path)
Parameters taken: parser options and filesystem path
Return values: middleware handlers
Real-world analogy: Mailroom that opens letters and stores attachments in a public archive shelf.
Best practices or improvements: Add file cache headers and stricter upload path hardening.

Concept Name: MongoDB connection lifecycle with Mongoose
Where used: db.js, server.js
Purpose: Initialize and maintain the DB connection before serving data operations.
How it works: connectDB awaits mongoose.connect with MONGO_URI; process exits on connection failure.
Syntax overview:
Function names: connectDB(), mongoose.connect(uri)
Parameters taken: MONGO_URI string
Return values: Mongoose connection object; process exit on fatal failure
Real-world analogy: Opening a warehouse gate before accepting purchase orders.
Best practices or improvements: Add retry/backoff and readiness endpoint tied to DB state.

Concept Name: ODM data modeling with Mongoose schemas
Where used: User.js, Post.js, Comment.js
Purpose: Define data structure, validation, defaults, references, and indexes in one place.
How it works: mongoose.Schema defines fields and constraints, then mongoose.model creates model classes used by routes/services.
Syntax overview:
Function names: new mongoose.Schema(definition, options), mongoose.model(name, schema)
Parameters taken: field definitions, options like timestamps and toJSON
Return values: Model constructors User, Post, Comment
Real-world analogy: Standardized forms that every record must follow.
Best practices or improvements: Add schema-level enums for controlled values if new post/comment states are introduced.

Concept Name: Field-level validation and constraints
Where used: User.js, Post.js, Comment.js
Purpose: Keep bad or malformed data out of the database.
How it works: required, minlength, maxlength, regex match, unique, trim, lowercase, conditional required.
Syntax overview:
Function names: schema field validators and runValidators in findByIdAndUpdate calls
Parameters taken: validation rules and custom messages
Return values: ValidationError on invalid input
Real-world analogy: Form checks that reject incomplete applications at the counter.
Best practices or improvements: Align frontend max lengths with backend limits (example: post/comment text limits differ today).

Concept Name: Schema hooks, methods, and virtuals
Where used: User.js, Post.js
Purpose: Encapsulate model behavior such as password hashing and computed fields.
How it works: pre save hashes password; instance method compares passwords; virtuals compute follower/like counts dynamically.
Syntax overview:
Function names: schema.pre('save', fn), schema.methods.matchPassword(), schema.virtual(name).get(fn)
Parameters taken: entered password, document context this
Return values: hashed password, boolean comparison, computed count values
Real-world analogy: Auto-calculated totals on invoices plus automatic signature stamping before filing.
Best practices or improvements: Consider moving expensive computed values to denormalized counters if traffic grows very high.

Concept Name: Relationship modeling and population
Where used: User.js, Post.js, Comment.js, usersApi.js, postsApi.js, commentsApi.js
Purpose: Connect users, posts, comments, followers, and likes.
How it works: ObjectId refs store relationships; populate hydrates selected user/post fields at query time.
Syntax overview:
Function names: Model.find(), Model.findById(), query.populate(path, select)
Parameters taken: filter objects, ref path names, projection strings
Return values: documents with referenced fields expanded
Real-world analogy: A contact sheet that stores IDs and fetches full profiles only when needed.
Best practices or improvements: Add selective lean queries in read-heavy endpoints for lower memory overhead.

Concept Name: Authentication and authorization using JWT Bearer tokens
Where used: authService.js, authMiddleware.js, commonApi.js
Purpose: Verify user identity and protect private routes.
How it works: login/register issue token; protect middleware verifies token, loads req.user, blocks unauthorized access.
Syntax overview:
Function names: jwt.sign(payload, secret, options), jwt.verify(token, secret), protect(req,res,next), registerUser, loginUser, getAuthUser
Parameters taken: user id payload, JWT_SECRET, expiresIn, Authorization header
Return values: token string, decoded payload, attached req.user, 401/403 responses when invalid
Real-world analogy: Signed visitor pass checked at every restricted room.
Best practices or improvements: Add token rotation or refresh strategy for improved long-session UX/security.

Concept Name: Password hashing with bcrypt
Where used: User.js, authService.js
Purpose: Store passwords safely and compare without plaintext storage.
How it works: pre-save hook hashes new/changed passwords; login compares candidate password to hash.
Syntax overview:
Function names: bcrypt.hash(password, saltRounds), bcrypt.compare(plain, hash), user.matchPassword(entered)
Parameters taken: plaintext password and hash
Return values: hashed string and boolean match
Real-world analogy: Storing a fingerprint pattern, not the fingerprint itself.
Best practices or improvements: Add account lockout/rate limiting for repeated failed logins.

Concept Name: RESTful API design and HTTP semantics
Where used: commonApi.js, usersApi.js, postsApi.js, commentsApi.js, req.http
Purpose: Expose predictable resource-oriented endpoints for frontend consumption.
How it works: GET for read, POST for create/actions, PUT for update, PATCH for soft-delete/restore; status codes reflect outcome.
Syntax overview:
Function names: router.get/post/put/patch handlers
Parameters taken: path params (id, postId), query params (page, q), body payloads
Return values: JSON shape with message, payload, and metadata like hasMore
Real-world analogy: A standard menu where each request type has a known meaning.
Best practices or improvements: Standardize response envelope across all endpoints (success, message, payload, meta).

Concept Name: Feed filtering and pagination
Where used: postsApi.js
Purpose: Return manageable chunks of timeline data and prioritize followed users.
How it works: page and limit query params drive skip/limit; filter includes followed IDs + own ID, fallback to all posts if no follows.
Syntax overview:
Function names: Post.find(filter).sort().skip().limit(), Post.countDocuments(filter)
Parameters taken: page, limit, followingIds, isDeleted filter
Return values: posts list, currentPage, totalPages, hasMore
Real-world analogy: Newspaper delivery in daily bundles, with local section prioritized.
Best practices or improvements: Move to cursor-based pagination for better consistency under concurrent writes.

Concept Name: Soft delete with archive and restore flows
Where used: Post.js, Comment.js, postsApi.js, commentsApi.js
Purpose: Preserve data while hiding it from normal views and allowing restore.
How it works: isDeleted flag toggles visibility; archive endpoints fetch deleted records; restore endpoints flip flag back.
Syntax overview:
Function names: soft-delete PATCH handlers, restore PATCH handlers, archive GET handlers
Parameters taken: resource id, authenticated user id for ownership checks
Return values: confirmation messages and restored payloads
Real-world analogy: Moving files to an archive cabinet instead of shredding them.
Best practices or improvements: Add deletedAt timestamp and scheduled permanent purge policy.

Concept Name: Toggle interactions for likes and follows
Where used: postsApi.js, usersApi.js
Purpose: Single endpoint toggles relation on/off, simplifying client logic.
How it works: Check current membership in array, then push or pull accordingly, return new state and count.
Syntax overview:
Function names: includes(), push(), pull(), filter(), save()
Parameters taken: target resource id and current user id
Return values: boolean liked/following and updated counts
Real-world analogy: One light switch for both ON and OFF.
Best practices or improvements: Enforce uniqueness at schema level for relation arrays or move to dedicated relation collection at scale.

Concept Name: Denormalized counters for fast reads
Where used: User.js, Post.js, postsApi.js, commentsApi.js
Purpose: Avoid expensive count queries by storing postsCount/commentsCount directly.
How it works: Increment/decrement counters when create/delete/restore actions occur.
Syntax overview:
Function names: findByIdAndUpdate({ $inc: { field: +/-1 } }), document.save()
Parameters taken: document id, inc delta
Return values: updated counter values on subsequent reads
Real-world analogy: Keeping a running score on a scoreboard instead of recounting every point.
Best practices or improvements: Wrap related writes in transactions if strict consistency is required.

Concept Name: File upload pipeline with Multer (local disk storage)
Where used: uploadMiddleware.js, postsApi.js, server.js
Purpose: Accept optional post images with type and size checks.
How it works: upload.single(image) stores files under uploads, route builds public URL /uploads/filename, static server exposes files.
Syntax overview:
Function names: multer.diskStorage(), multer({ storage, fileFilter, limits }), upload.single('image')
Parameters taken: file object, callback, file size limit
Return values: req.file metadata and image URL in saved post
Real-world analogy: Receiving mail attachments and shelving them in a labeled cabinet.
Best practices or improvements: Add cloud object storage (S3/Cloudinary) for production durability and CDN performance.

Concept Name: Centralized error handling and normalization
Where used: errorHandler.js, server.js
Purpose: Convert diverse internal exceptions into predictable API error responses.
How it works: Global error middleware maps CastError, ValidationError, duplicate key, JWT, and Multer errors to status/message.
Syntax overview:
Function names: errorHandler(err, req, res, next)
Parameters taken: error object and request context
Return values: JSON error envelope with optional stack in development
Real-world analogy: One central customer support desk translating all complaints into standard tickets.
Best practices or improvements: Add error codes and request IDs so frontend can branch on machine-readable errors.

Concept Name: Environment-based configuration
Where used: server.js, db.js, authService.js, authMiddleware.js, errorHandler.js
Purpose: Keep secrets and environment-specific settings outside source code.
How it works: dotenv loads variables like MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, PORT, CORS_ORIGIN, NODE_ENV.
Syntax overview:
Function names: dotenv.config(), process.env access
Parameters taken: env keys
Return values: runtime config values used by DB/auth/server
Real-world analogy: Adjustable machine settings loaded from a control panel before startup.
Best practices or improvements: Add config schema validation at boot and separate env files for dev/staging/prod.

Concept Name: Async concurrency with Promise.all
Where used: usersApi.js, Profile.jsx, Archives.jsx
Purpose: Fetch independent resources in parallel to reduce response/wait time.
How it works: Two or more async calls execute concurrently, then results are consumed together.
Syntax overview:
Function names: Promise.all([promise1, promise2])
Parameters taken: array of promises
Return values: array of resolved values in order
Real-world analogy: Sending two clerks to fetch different files simultaneously.
Best practices or improvements: Add partial failure strategy when one call fails but others can still be shown.

Concept Name: API testing collection for manual endpoint verification
Where used: req.http
Purpose: Quickly test complete API behavior during development.
How it works: HTTP request blocks define method, URL, headers, body, and auth token examples.
Syntax overview:
Function names: HTTP verbs in request blocks
Parameters taken: endpoint URL, JSON payloads, Authorization headers
Return values: manual response inspection in editor REST client
Real-world analogy: A checklist for quality inspectors to verify each workflow.
Best practices or improvements: Add automated integration tests to complement manual scripts.

Concept Name: Partial/unused backend artifacts (important design signal)
Where used: Like.js, Follow.js, check.js, package.json, postsApi.js
Purpose: Show planned architecture options and technical debt areas.
How it works: Like and Follow models exist but live flow currently uses arrays on User/Post; check script uses CommonJS require in an ESM project; cookie-parser dependency is installed but not used.
Syntax overview:
Function names: Like model hooks, Follow model hooks, check() utility
Parameters taken: relation IDs and post/user IDs
Return values: currently not part of active request path
Real-world analogy: Spare parts in a workshop that are not connected to the current machine.
Best practices or improvements: Remove unused dependencies/imports, or fully adopt relation collections if that is the target design.

Frontend Concepts

Concept Name: React SPA bootstrap and Strict Mode
Where used: main.jsx, package.json
Purpose: Start the client app and surface side-effect issues during development.
How it works: createRoot mounts App inside StrictMode.
Syntax overview:
Function names: createRoot(element).render(tree), StrictMode wrapper
Parameters taken: root DOM node and root component tree
Return values: mounted interactive UI
Real-world analogy: Running a machine in diagnostic mode while assembling it.
Best practices or improvements: Keep StrictMode enabled in dev; verify idempotent effects.

Concept Name: Client routing with nested protected routes
Where used: App.jsx, ProtectedRoute.jsx, MainLayout.jsx
Purpose: Define public and private pages, shared layout shell, and fallback redirects.
How it works: BrowserRouter + Routes; protected parent route wraps MainLayout; Outlet renders child page content.
Syntax overview:
Function names: BrowserRouter, Routes, Route, Navigate, Outlet
Parameters taken: path strings, element components
Return values: matched page component rendered in layout slot
Real-world analogy: Secure campus building where only badge holders can enter inner floors.
Best practices or improvements: Add explicit not-found page instead of silent redirect for unknown URLs.

Concept Name: Global auth state using React Context API
Where used: AuthContext.jsx, App.jsx, ProtectedRoute.jsx
Purpose: Share user, token, loading state, and auth actions across all components without prop drilling.
How it works: AuthProvider stores state and methods; useAuth hook exposes context values; init effect validates token via backend.
Syntax overview:
Function names: createContext(), useContext(), useAuth(), AuthProvider(), login(), register(), logout(), refreshUser()
Parameters taken: credentials/user data, children components
Return values: context object with state and async auth functions
Real-world analogy: Company badge registry available at every gate in the building.
Best practices or improvements: Consider storing token in httpOnly cookies for stronger XSS resistance.

Concept Name: Axios client abstraction and interceptors
Where used: api.js
Purpose: Centralize base URL, auth header attachment, and uniform 401 handling.
How it works: Axios instance adds Bearer token in request interceptor; response interceptor clears session and redirects on unauthorized response.
Syntax overview:
Function names: axios.create(), api.interceptors.request.use(), api.interceptors.response.use()
Parameters taken: request config and error objects
Return values: modified config/response or rejected promise
Real-world analogy: A postal center that stamps every outgoing envelope with sender credentials.
Best practices or improvements: Replace hard redirect with router-driven logout flow to avoid full page reload.

Concept Name: Service layer for API contracts
Where used: authService.js, userService.js, postService.js, commentService.js
Purpose: Keep components clean and isolate endpoint URLs in one place.
How it works: Each service exports small wrapper functions around Axios instance calls.
Syntax overview:
Function names: register(data), login(data), getFeed(page), createPost(data), addComment(postId,text), toggleFollow(id), etc.
Parameters taken: ids, query strings, body objects/FormData
Return values: Axios promises resolving to backend JSON responses
Real-world analogy: Travel desk handling bookings so travelers do not contact every airline directly.
Best practices or improvements: Add TypeScript types or response schemas to reduce integration bugs.

Concept Name: Functional components and composition
Where used: MainLayout.jsx, PostCard.jsx, CreatePost.jsx, CommentSection.jsx, UserCard.jsx
Purpose: Build UI from reusable, isolated pieces with clear props contracts.
How it works: Parent pages compose child components and pass callbacks/data down.
Syntax overview:
Function names: component functions receiving props such as onPostCreated, post, postId, userData, children
Parameters taken: props objects and callbacks
Return values: JSX UI trees
Real-world analogy: Assembling a car from interchangeable modules (engine, dashboard, wheels).
Best practices or improvements: Add prop type validation or move to TypeScript interfaces.

Concept Name: React hooks for state and lifecycle
Where used: Home.jsx, Profile.jsx, PostDetail.jsx, Search.jsx, CreatePost.jsx
Purpose: Manage local state, side effects, memoization, refs, and router params.
How it works: useState stores UI data, useEffect fetches data on dependency changes, useCallback memoizes fetch function, useRef controls hidden file input, router hooks read location/params/navigation.
Syntax overview:
Function names: useState, useEffect, useCallback, useRef, useParams, useNavigate, useLocation, useSearchParams
Parameters taken: initial values, dependency arrays, callback functions
Return values: state setters, lifecycle execution, helper objects/functions
Real-world analogy: Dashboard switches, sensors, and scheduled maintenance triggers in one control room.
Best practices or improvements: Revoke object URLs created in CreatePost to avoid memory leaks.

Concept Name: Form handling and client-side validation
Where used: Login.jsx, Register.jsx, Settings.jsx, CreatePost.jsx, CommentSection.jsx
Purpose: Provide instant user feedback before hitting backend and reduce invalid requests.
How it works: Controlled inputs mirror form state, validate() builds error map, submission blocked if invalid.
Syntax overview:
Function names: validate(), handleSubmit(e), onChange handlers
Parameters taken: event object and form fields
Return values: boolean valid flags and async API results
Real-world analogy: Spell-check before submitting an official document.
Best practices or improvements: Keep frontend limits aligned with backend schema constraints.

Concept Name: Authentication UX flow
Where used: Login.jsx, Register.jsx, App.jsx, AuthContext.jsx
Purpose: Let users register/login, persist session, and guard protected pages.
How it works: Login/register save token and user in localStorage; RootRedirect routes authenticated users to /home; ProtectedRoute blocks unauthenticated access.
Syntax overview:
Function names: login(form), register(form), logout(), RootRedirect(), ProtectedRoute()
Parameters taken: credentials or user form data
Return values: user state transitions and route redirects
Real-world analogy: Hotel check-in creates a keycard, check-out invalidates it.
Best practices or improvements: Add loading skeleton for RootRedirect instead of returning null during auth boot.

Concept Name: Data fetching and asynchronous UI states
Where used: Home.jsx, Profile.jsx, Archives.jsx, RightSidebar.jsx, CommentSection.jsx
Purpose: Synchronize UI with backend while handling loading, success, and empty states.
How it works: Async fetch functions set loading flags, then render LoadingSpinner, EmptyState, or content.
Syntax overview:
Function names: fetchFeed, fetchProfile, fetchArchives, fetchRecommendations, fetchComments
Parameters taken: ids, page, query terms
Return values: state updates and rendered lists/cards
Real-world analogy: Restaurant showing waiting, served, or sold-out status per dish.
Best practices or improvements: Add retry buttons and per-section error UI instead of only toasts.

Concept Name: Optimistic updates for interactions
Where used: PostCard.jsx, UserCard.jsx, Profile.jsx
Purpose: Make likes/follows feel instant before server confirmation.
How it works: UI state is updated immediately, then reverted if API call fails.
Syntax overview:
Function names: handleLike(), handleFollow()
Parameters taken: target ids via props/context
Return values: immediate local state change and eventual server synchronization
Real-world analogy: Turning on a lamp switch before the electric meter confirms power draw.
Best practices or improvements: Use functional state updates consistently to avoid stale closure issues during rapid clicks.

Concept Name: Pagination and incremental loading
Where used: Home.jsx, postsApi.js
Purpose: Avoid loading entire feed at once and improve perceived performance.
How it works: Home tracks page and hasMore, requests next page on Load More button.
Syntax overview:
Function names: getFeed(page), fetchFeed(pageNum, append), loadMore()
Parameters taken: page index and append flag
Return values: merged posts array and updated pagination state
Real-world analogy: Reading a long report page by page instead of printing all pages at once.
Best practices or improvements: Switch to intersection observer auto-load for smoother mobile UX.

Concept Name: URL-driven search state
Where used: Search.jsx, Navbar.jsx, usersApi.js
Purpose: Make search shareable/bookmarkable via query string.
How it works: Navbar and Search page set q param; Search useEffect triggers API call when q changes.
Syntax overview:
Function names: useSearchParams(), setSearchParams(), searchUsers(q), navigate('/search?q=...')
Parameters taken: query string and input text
Return values: filtered user list in state
Real-world analogy: Library catalog URL that always reflects current keyword.
Best practices or improvements: Add debounce to reduce API calls during rapid typing.

Concept Name: Reusable layout and responsive navigation
Where used: MainLayout.jsx, Navbar.jsx, Sidebar.jsx, RightSidebar.jsx, MobileBottomNav.jsx, MobileFAB.jsx
Purpose: Keep a consistent shell while adapting navigation patterns for desktop and mobile.
How it works: MainLayout composes top nav, sidebars, outlet, and mobile controls with hidden/breakpoint classes.
Syntax overview:
Function names: layout component functions and router Outlet
Parameters taken: none or route/location-derived state
Return values: responsive multi-column/stacked UI
Real-world analogy: Same shopping mall with different entrances and signs for cars vs pedestrians.
Best practices or improvements: Add keyboard accessibility and aria labels on icon-only controls.

Concept Name: Shared styling tokens and utility-first CSS
Where used: common.js, index.css, vite.config.js
Purpose: Centralize reusable class strings and keep visual consistency across components.
How it works: Tailwind utilities are composed into exported constants; components import these style tokens; base CSS adds scrollbars and safe-area utilities.
Syntax overview:
Function names: exported style constants like primaryBtn, postCard, pageTitleClass
Parameters taken: optional concatenation with local classes
Return values: final className strings used by JSX elements
Real-world analogy: A design system style guide used by all teams in a product company.
Best practices or improvements: Define a clearer single color system, because some components still mix older purple gradients with newer neutral palette.

Concept Name: Notifications and iconography
Where used: App.jsx, CreatePost.jsx, PostCard.jsx, Settings.jsx
Purpose: Provide immediate feedback and recognizable visual affordances.
How it works: react-hot-toast displays global toasts; react-icons provides consistent icon components across nav/actions.
Syntax overview:
Function names: Toaster component, toast.success(), toast.error(), icon components like HiHeart/HiSearch
Parameters taken: message strings and optional config
Return values: transient user notifications and rendered SVG icon nodes
Real-world analogy: Dashboard indicator lights and chimes in a vehicle cockpit.
Best practices or improvements: Add semantic toast categories and avoid overusing toast for expected empty states.

Concept Name: Frontend build tooling and dev proxy
Where used: package.json, vite.config.js, eslint.config.js
Purpose: Speed up development and enforce code quality.
How it works: Vite handles dev/build/preview, proxy forwards /api and /uploads to backend, ESLint enforces hooks and unused vars rules.
Syntax overview:
Function names: defineConfig(), plugins array, npm scripts dev/build/lint/preview
Parameters taken: proxy target URLs, lint rule config
Return values: dev server behavior and production bundle
Real-world analogy: Factory assembly line tools plus quality inspection checkpoints.
Best practices or improvements: Add formatter and CI lint step to enforce consistency automatically.

Concept Name: Environment variables on frontend side (current state)
Where used: api.js, vite.config.js
Purpose: Environment-specific behavior currently achieved via proxy, not runtime env in client code.
How it works: Axios baseURL is /api and relies on Vite proxy in development; there is no import.meta.env usage in src right now.
Syntax overview:
Function names: axios.create({ baseURL: '/api' }) and Vite proxy config
Parameters taken: path prefixes and target backend URL
Return values: transparent local API routing in dev
Real-world analogy: A local switchboard forwarding calls to the real office.
Best practices or improvements: Add VITE_API_BASE_URL for production builds where proxy is not present.

Extra Concepts

Concept Name: Folder architecture and separation of concerns
Where used: backend, src
Purpose: Keep API/domain logic and UI logic cleanly separated and maintainable.
How it works: Backend splits api, middleware, models, services, config; frontend splits pages, components, context, services, styles.
Syntax overview:
Function names: module exports/imports across layers
Parameters taken: data contracts passed between layers
Return values: predictable module boundaries
Real-world analogy: Different departments in a company with clear responsibilities.
Best practices or improvements: Add explicit controller layer in backend for large-scale maintainability.

Concept Name: End-to-end data flow between frontend and backend
Where used: CreatePost.jsx, postService.js, api.js, postsApi.js, authMiddleware.js, Post.js
Purpose: Move user actions to persisted data and back to UI updates.
How it works: UI event triggers service call, Axios injects token, backend middleware authenticates, route updates DB, JSON returns, frontend state updates and re-renders.
Syntax overview:
Function names: handleSubmit -> createPost -> API route -> Post.create -> response -> setPosts
Parameters taken: form data, headers, route params, model payload
Return values: saved document payload and updated client state
Real-world analogy: Customer order from app -> cashier -> kitchen -> delivery back to customer.
Best practices or improvements: Add request/response typing and API schema docs to tighten contract safety.

Concept Name: Advanced patterns currently used
Where used: postsApi.js, commentsApi.js, Home.jsx, AuthContext.jsx, api.js
Purpose: Improve UX and maintainability beyond basic CRUD.
How it works:
Pattern 1: Soft delete with restore archives
Pattern 2: Optimistic UI actions
Pattern 3: Context-driven auth session bootstrap
Pattern 4: Interceptor-based token/header policy
Pattern 5: Recommendation fallback via empty search query
Syntax overview:
Function names: restorePost/restoreComment, handleLike, initAuth, request/response interceptors
Parameters taken: ids, token, page/query values
Return values: smooth user experience with centralized behavior
Real-world analogy: Smart office automation where common tasks are pre-wired.
Best practices or improvements: Introduce a query cache library for stale-while-revalidate and automatic cache invalidation.

Concept Name: Deployment readiness concepts and current gaps
Where used: server.js, vite.config.js, package.json, package.json
Purpose: Prepare app to run outside local machine.
How it works now: Backend reads PORT and CORS_ORIGIN, frontend builds with Vite; dev proxy supports local integration.
Syntax overview:
Function names: app.listen(PORT), npm run build, vite preview
Parameters taken: environment variables and host URLs
Return values: deployable backend process + static frontend bundle
Real-world analogy: Product prototype that can run in a showroom but still needs shipping packaging standards.
Best practices or improvements:

Add production start scripts and process manager config for backend.

Add frontend runtime API base strategy for hosted environments.

Add deployment docs for Render/Vercel (env vars, build command, start command, CORS origin).

Add health/readiness endpoints and basic monitoring.
