## Developing

Config comes from [match-config](https://github.com/beacon-help/match-config),
vendored as a git submodule. Populate it, then install dependencies:

```bash
git submodule update --init
pnpm install
```

The app reads the `frontend` section through `import config from 'virtual:match-config'`.
`ENV` picks the environment (default `dev`) and is baked in at build time. For local
overrides, put a gitignored `config.local.yaml` at the repo root:

```yaml
frontend:
  api_base_url: http://localhost:9000
```

Start a development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
