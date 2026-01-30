# Plano de Migração: Note-Taking App com Collections

## Visão Geral

Transformar o app atual de bookmark manager em um **note-taking app híbrido** baseado em **Collections**. Cada workspace terá collections padrão fixas (Notes, Links) e permitirá collections custom criadas pelo usuário. Removemos o conceito de "Inbox" (vibe de email) e simplificamos para uma navegação por coleções.

## Filosofia de Design

**Collections = Folders inteligentes**
- Collections default: **Notes** (só notas), **Links** (só links) - fixas, imutáveis
- Collections custom: Criadas pelo usuário, aceitam **links e notas misturados**
- Hierarquia: `Workspace > Collection > Items`
- Items sempre pertencem a uma collection (nunca direto ao workspace)
- Favorites/Archive/Trash são **filtros globais** (flags nos items), não collections

---

## Arquitetura Proposta

### 1. Database Schema (Drizzle) - REVISADO

**Nova tabela: `collections`**
```typescript
// src/lib/server/db/schema.ts
export const COLLECTION_TYPES = {
  NOTES: 'notes',     // Default: só aceita notas
  LINKS: 'links',     // Default: só aceita links
  CUSTOM: 'custom'    // User-created: aceita ambos
} as const;

export type CollectionType = typeof COLLECTION_TYPES[keyof typeof COLLECTION_TYPES];

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  type: text('type').$type<CollectionType>().notNull().default('custom'),
  icon: text('icon'), // Emoji ou ícone opcional
  isDefault: integer('is_default', { mode: 'boolean' }).default(false), // true para Notes/Links defaults
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  index('idx_collections_workspace').on(t.workspaceId),
  uniqueIndex('idx_collections_workspace_slug').on(t.workspaceId, t.slug),
]);

// Links table - ATUALIZADA com collectionId
export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id), // NOVO: FK para collection
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  image: text('image'),
  author: text('author'),
  publisher: text('publisher'),
  logo: text('logo'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  index('idx_links_collection').on(t.collectionId),
  index('idx_links_workspace').on(t.workspaceId),
  index('idx_links_fav').on(t.isFavorite, t.isDeleted).where(sql`${t.isFavorite} = 1 AND ${t.isDeleted} = 0`),
  index('idx_links_archived').on(t.isArchived, t.isDeleted).where(sql`${t.isArchived} = 1 AND ${t.isDeleted} = 0`),
]);

// Notes table - NOVA
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  collectionId: text('collection_id').notNull().references(() => collections.id), // FK para collection
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown content
  excerpt: text('excerpt'), // Auto-generated
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (t) => [
  index('idx_notes_collection').on(t.collectionId),
  index('idx_notes_workspace').on(t.workspaceId),
  index('idx_notes_fav').on(t.isFavorite, t.isDeleted).where(sql`${t.isFavorite} = 1 AND ${t.isDeleted} = 0`),
]);

// Tags e junction tables (mantidos, mas com note_tags adicionado)
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const linkTags = sqliteTable('link_tags', {
  linkId: text('link_id').notNull().references(() => links.id),
  tagId: text('tag_id').notNull().references(() => tags.id),
}, (t) => [primaryKey({ columns: [t.linkId, t.tagId] })]);

export const noteTags = sqliteTable('note_tags', {
  noteId: text('note_id').notNull().references(() => notes.id),
  tagId: text('tag_id').notNull().references(() => tags.id),
}, (t) => [primaryKey({ columns: [t.noteId, t.tagId] })]);
```

---

### 2. Tipos e Constantes - REVISADOS

**src/lib/types.ts:**
```typescript
export type CollectionId = string & { readonly __brand: 'CollectionId' };
export type NoteId = string & { readonly __brand: 'NoteId' };

export interface Collection {
  id: CollectionId;
  workspaceId: WorkspaceId;
  name: string;
  slug: string;
  type: 'notes' | 'links' | 'custom';
  icon?: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  itemCount?: number; // Computed
}

export interface Note {
  id: NoteId;
  collectionId: CollectionId;
  workspaceId: WorkspaceId;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

// Links existentes ATUALIZADOS
export interface Link {
  id: LinkId;
  collectionId: CollectionId; // NOVO
  workspaceId: WorkspaceId;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  author: string | null;
  publisher: string | null;
  logo: string | null;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

// Union type para items
export type Item = 
  | { type: 'link'; data: Link }
  | { type: 'note'; data: Note };

// Filtros simplificados (sem Inbox)
export type ItemStatus = 'active' | 'favorites' | 'archive' | 'trash';
```

**src/lib/constants.ts:**
```typescript
// Collections defaults por workspace
export const DEFAULT_COLLECTIONS = {
  NOTES: {
    name: 'Notes',
    slug: 'notes',
    type: 'notes' as const,
    icon: '📝'
  },
  LINKS: {
    name: 'Links', 
    slug: 'links',
    type: 'links' as const,
    icon: '🔗'
  }
};

export const COLLECTION_TYPES = {
  NOTES: 'notes',
  LINKS: 'links',
  CUSTOM: 'custom'
} as const;

export const ITEM_STATUS = {
  ACTIVE: 'active',       // !isArchived && !isDeleted
  FAVORITES: 'favorites', // isFavorite && !isDeleted
  ARCHIVE: 'archive',     // isArchived && !isDeleted
  TRASH: 'trash'          // isDeleted
} as const;

export const API_ENDPOINTS = {
  LINKS: '/api/links',
  NOTES: '/api/notes',
  COLLECTIONS: '/api/collections',  // NOVO
  WORKSPACES: '/api/workspaces',
  MIGRATE: '/api/migrate'
} as const;
```

---

### 3. Domain Stores - REVISADOS

#### 3.1 collections.svelte.ts (NOVO)

**Local:** `src/lib/stores/domain/collections.svelte.ts`

```typescript
export function createCollectionsStore(options: { repository: Repository; logger: Logger }) {
  // State
  let collections = $state<Collection[]>([]);
  let activeCollectionId = $state<CollectionId | null>(null);
  
  // Getters
  const all = $derived(collections);
  const defaults = $derived(collections.filter(c => c.isDefault));
  const custom = $derived(collections.filter(c => !c.isDefault));
  const active = $derived(collections.find(c => c.id === activeCollectionId) || defaults[0] || null);
  const byWorkspace = $derived((workspaceId: WorkspaceId) => 
    collections.filter(c => c.workspaceId === workspaceId)
  );
  
  // Ações
  async function fetchForWorkspace(workspaceId: WorkspaceId): Promise<Result<void, ApiError>> {
    const result = await options.repository.fetchCollections(workspaceId);
    if (result.ok) {
      collections = result.value;
    }
    return result;
  }
  
  async function createCustom(name: string, icon?: string): Promise<Result<Collection, ApiError>> {
    // Slugify name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const result = await options.repository.createCollection({
      workspaceId: active?.workspaceId!,
      name,
      slug,
      type: 'custom',
      icon,
      isDefault: false
    });
    
    if (result.ok) {
      collections = [...collections, result.value];
    }
    return result;
  }
  
  function setActive(id: CollectionId) {
    activeCollectionId = id;
  }
  
  async function deleteCustom(id: CollectionId): Promise<Result<void, ApiError>> {
    const collection = collections.find(c => c.id === id);
    if (!collection || collection.isDefault) {
      return { ok: false, error: new Error('Cannot delete default collections') };
    }
    
    const result = await options.repository.deleteCollection(id);
    if (result.ok) {
      collections = collections.filter(c => c.id !== id);
      if (activeCollectionId === id) {
        activeCollectionId = defaults[0]?.id || null;
      }
    }
    return result;
  }
  
  return {
    get all() { return all; },
    get defaults() { return defaults; },
    get custom() { return custom; },
    get active() { return active; },
    get activeId() { return activeCollectionId; },
    byWorkspace,
    fetchForWorkspace,
    createCustom,
    setActive,
    deleteCustom
  };
}
```

#### 3.2 notes.svelte.ts (NOVO)

Seguir padrão de links.svelte.ts mas com:
- `fetchForCollection(collectionId: CollectionId)` ao invés de workspace
- `addToCollection(collectionId: CollectionId, ...)`
- Validação: só pode adicionar em collections do tipo 'notes' ou 'custom'

#### 3.3 links.svelte.ts (ATUALIZADO)

Modificar para:
- `fetchForCollection(collectionId: CollectionId)` ao invés de workspace
- Items têm collectionId
- Validação: só pode adicionar em collections do tipo 'links' ou 'custom'

---

### 4. UI Stores - REVISADOS

#### 4.1 filters.svelte.ts

```typescript
interface FilterState {
  search: string;
  tags: string[];
  status: ItemStatus; // active | favorites | archive | trash (sem 'inbox')
}

// filteredItems filtra por:
// 1. Collection ativa (se houver)
// 2. Status (favorites/archive/trash/active)
// 3. Tags
// 4. Search (título e conteúdo das notas)
```

---

### 5. UI Components - REVISADOS

#### 5.1 AppSidebar - REORGANIZADO

Nova estrutura visual:
```
┌─────────────────────────┐
│  📁 Workspaces          │
│     • Active WS         │
│     • Work              │
│     • Personal          │
├─────────────────────────┤
│  📂 Collections         │
│     📝 Notes            │ ← Default (só notas)
│     🔗 Links            │ ← Default (só links)
│     ─────────────────── │
│     📂 Projetos         │ ← Custom
│     📂 Research         │ ← Custom
│     + New Collection    │
├─────────────────────────┤
│  ⭐ Favorites           │ ← Filtro global
│  📦 Archive             │ ← Filtro global
│  🗑️  Trash              │ ← Filtro global
├─────────────────────────┤
│  🏷️  Tags               │
│     • javascript        │
│     • design            │
└─────────────────────────┘
```

**src/lib/components/AppSidebar.svelte:**
```svelte
<Sidebar>
  <!-- Workspaces Section -->
  <Sidebar.Group>
    <Sidebar.GroupLabel>Workspaces</Sidebar.GroupLabel>
    <Sidebar.Menu>
      {#each workspaces.all as workspace}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton 
            isActive={workspace.id === workspaces.activeId}
            onclick={() => workspaces.setActive(workspace.id)}
          >
            <span>{workspace.icon || '📁'}</span>
            <span>{workspace.name}</span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.Group>
  
  <Sidebar.Separator />
  
  <!-- Collections Section -->
  <Sidebar.Group>
    <Sidebar.GroupLabel>Collections</Sidebar.GroupLabel>
    <Sidebar.Menu>
      <!-- Default Collections -->
      {#each collections.defaults as collection}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton 
            isActive={collection.id === collections.activeId && filters.status === 'active'}
            onclick={() => {
              collections.setActive(collection.id);
              filters.setStatus('active');
            }}
          >
            <span>{collection.icon}</span>
            <span>{collection.name}</span>
            <span class="ml-auto text-muted-foreground text-xs">
              {collection.itemCount}
            </span>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
      
      <Sidebar.Separator />
      
      <!-- Custom Collections -->
      {#each collections.custom as collection}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton 
            isActive={collection.id === collections.activeId && filters.status === 'active'}
            onclick={() => {
              collections.setActive(collection.id);
              filters.setStatus('active');
            }}
          >
            <span>{collection.icon || '📂'}</span>
            <span>{collection.name}</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger class="ml-auto">
                <MoreHorizontal class="w-4 h-4" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onclick={() => collections.deleteCustom(collection.id)}>
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
      
      <!-- Add Collection Button -->
      <Sidebar.MenuItem>
        <Sidebar.MenuButton onclick={() => showCreateCollectionDialog = true}>
          <Plus class="w-4 h-4" />
          <span>New Collection</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Group>
  
  <Sidebar.Separator />
  
  <!-- Global Filters Section -->
  <Sidebar.Group>
    <Sidebar.GroupLabel>Filters</Sidebar.GroupLabel>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton 
          isActive={filters.status === 'favorites'}
          onclick={() => filters.setStatus('favorites')}
        >
          <Star class="w-4 h-4" />
          <span>Favorites</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton 
          isActive={filters.status === 'archive'}
          onclick={() => filters.setStatus('archive')}
        >
          <Archive class="w-4 h-4" />
          <span>Archive</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton 
          isActive={filters.status === 'trash'}
          onclick={() => filters.setStatus('trash')}
        >
          <Trash class="w-4 h-4" />
          <span>Trash</span>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Group>
</Sidebar>
```

#### 5.2 CollectionForm Dialog (NOVO)

**src/lib/components/CollectionForm.svelte:**
- Input: Nome
- Input: Ícone (emoji picker simples)
- Botões: Create, Cancel
- Validação: slug único por workspace

#### 5.3 WorkspaceHeader - REVISADO

**src/lib/components/WorkspaceHeader.svelte:**
```svelte
<header class="flex items-center justify-between h-12 px-4 border-b">
  <!-- Left: Collection info -->
  <div class="flex items-center gap-2">
    <span class="text-lg">{collections.active?.icon}</span>
    <h1 class="font-medium">{collections.active?.name}</h1>
    {#if collections.active?.isDefault}
      <Badge variant="secondary" class="text-xs">Default</Badge>
    {/if}
  </div>
  
  <!-- Right: Actions -->
  <div class="flex items-center gap-2">
    <SearchInput bind:value={filters.search} />
    
    <!-- Dropdown: Novo item -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild let:builder>
        <Button builders={[builder]} size="sm">
          <Plus class="w-4 h-4 mr-1" />
          New
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {#if collections.active?.type === 'notes' || collections.active?.type === 'custom'}
          <DropdownMenu.Item onclick={() => openNoteForm()}>
            <FileText class="w-4 h-4 mr-2" />
            Note
          </DropdownMenu.Item>
        {/if}
        {#if collections.active?.type === 'links' || collections.active?.type === 'custom'}
          <DropdownMenu.Item onclick={() => openLinkForm()}>
            <Link class="w-4 h-4 mr-2" />
            Link
          </DropdownMenu.Item>
        {/if}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
    
    <ViewToggle bind:mode={settings.viewMode} />
  </div>
</header>
```

#### 5.4 NoteEditor/NoteCard/NoteItem (NOVOS)

Mantêm a mesma estrutura do plano original.

---

### 6. Workspace Initialization - IMPORTANTE

Quando um workspace é criado, **automaticamente criar as collections default:**

**src/lib/stores/domain/workspaces.svelte.ts:**
```typescript
async function add(name: string, icon?: string): Promise<Result<Workspace, ApiError>> {
  const result = await options.repository.createWorkspace({ name, slug, icon });
  
  if (result.ok) {
    const workspace = result.value;
    
    // Criar collections default automaticamente
    await options.repository.createCollection({
      workspaceId: workspace.id,
      ...DEFAULT_COLLECTIONS.NOTES,
      isDefault: true
    });
    
    await options.repository.createCollection({
      workspaceId: workspace.id,
      ...DEFAULT_COLLECTIONS.LINKS,
      isDefault: true
    });
    
    workspaces = [...workspaces, workspace];
  }
  
  return result;
}
```

---

### 7. Migration Scripts

#### 7.1 Migração de Schema

**drizzle/migrations/00x_add_collections.sql:**
```sql
-- Criar tabela collections
CREATE TABLE collections (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('notes', 'links', 'custom')),
  icon TEXT,
  is_default BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Criar índices para collections
CREATE INDEX idx_collections_workspace ON collections(workspace_id);
CREATE UNIQUE INDEX idx_collections_workspace_slug ON collections(workspace_id, slug);

-- Criar tabela notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  is_favorite BOOLEAN DEFAULT 0,
  is_archived BOOLEAN DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Criar tabela note_tags
CREATE TABLE note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Migrar links existentes
-- Adicionar collection_id em links (nullable temporariamente)
ALTER TABLE links ADD COLUMN collection_id TEXT REFERENCES collections(id);

-- Criar índices para notes
CREATE INDEX idx_notes_collection ON notes(collection_id);
CREATE INDEX idx_notes_workspace ON notes(workspace_id);
CREATE INDEX idx_notes_fav ON notes(is_favorite, is_deleted) WHERE is_favorite = 1 AND is_deleted = 0;

-- Atualizar índices de links
CREATE INDEX idx_links_collection ON links(collection_id);

-- Migration de dados existentes
-- Para cada workspace existente, criar collections Notes e Links defaults
-- e associar links existentes à collection Links do respectivo workspace
```

#### 7.2 Script de Migração de Dados

**src/routes/api/migrate/+server.ts (ATUALIZADO):**
```typescript
export async function POST({ request }) {
  // 1. Para cada workspace existente
  // 2. Criar collection "notes" (vazia, type='notes', isDefault=true)
  // 3. Criar collection "links" (type='links', isDefault=true)
  // 4. Atualizar todos os links existentes: collection_id = collection_links.id
  // 5. Remover nullable de collection_id em links
  
  return json({ success: true, migrated: { workspaces, collections, linksUpdated } });
}
```

---

### 8. API Routes - REVISADOS

#### 8.1 Collections

**src/routes/api/collections/+server.ts:**
- GET: Listar collections do workspace (query: workspaceId)
- POST: Criar collection custom

**src/routes/api/collections/[id]/+server.ts:**
- GET: Buscar collection
- PATCH: Renomear/alterar ícone (só custom)
- DELETE: Deletar (só custom, verificar se está vazia ou mover items)

#### 8.2 Notes

**src/routes/api/notes/+server.ts:**
- GET: Listar notas (query: collectionId, status, search, tags)
- POST: Criar nota (validar se collection aceita notas)

**src/routes/api/notes/[id]/+server.ts:**
- GET: Buscar nota
- PATCH: Atualizar
- DELETE: Soft delete

#### 8.3 Links (ATUALIZADO)

Modificar para usar collectionId ao invés de só workspaceId.

---

### 9. Checklist de Implementação - REVISADO

#### Fase 1: Foundation & Schema
- [ ] Adicionar tipos Collection, Note, NoteId em types.ts
- [ ] Atualizar constants.ts com DEFAULT_COLLECTIONS e COLLECTION_TYPES
- [ ] Criar migration SQL: tabela collections + notes + note_tags
- [ ] Atualizar tabela links: adicionar collection_id
- [ ] Criar schema.ts atualizado com todas as tabelas
- [ ] Rodar `drizzle-kit generate` e `drizzle-kit migrate`
- [ ] Adicionar `marked` ao package.json
- [ ] Instalar dependências

#### Fase 2: Backend & Stores
- [ ] Criar domain store collections.svelte.ts
- [ ] Criar domain store notes.svelte.ts
- [ ] Atualizar links.svelte.ts para usar collectionId
- [ ] Atualizar repository.ts com métodos de collections
- [ ] Criar API routes /api/collections
- [ ] Criar API routes /api/notes
- [ ] Atualizar API routes /api/links
- [ ] Criar endpoint de migração de dados
- [ ] Implementar auto-criação de collections default ao criar workspace

#### Fase 3: UI Components
- [ ] Criar MarkdownRenderer.svelte
- [ ] Criar NoteEditor.svelte
- [ ] Criar NoteCard.svelte / NoteItem.svelte
- [ ] Criar NoteForm.svelte
- [ ] Criar CollectionForm.svelte
- [ ] Reescrever AppSidebar com nova estrutura (Workspaces > Collections > Filtros)
- [ ] Atualizar WorkspaceHeader com dropdown de New (Note/Link)
- [ ] Atualizar filters.svelte.ts (remover Inbox, usar status)
- [ ] Atualizar +page.svelte para mostrar items da collection ativa

#### Fase 4: UX & Polish
- [ ] Animações na troca de collections
- [ ] Empty states específicos por tipo de collection
- [ ] Drag & drop de items entre collections (opcional)
- [ ] Keyboard shortcuts (Ctrl+K quick switch collection)
- [ ] Auto-save de notas
- [ ] Syntax highlighting em código (marked + highlight.js)
- [ ] Preview de markdown em tempo real (split view)

#### Fase 5: Testing & Migration
- [ ] Testar criação de workspace (deve criar collections default)
- [ ] Testar criação de collection custom
- [ ] Testar CRUD completo de notas em cada tipo de collection
- [ ] Testar CRUD de links atualizado
- [ ] Testar filtros globais (Favorites/Archive/Trash)
- [ ] Testar busca em conteúdo de notas
- [ ] Testar tags unificadas (links + notas)
- [ ] Testar deleção de collection custom (com e sem items)
- [ ] Rodar migration em dados existentes

---

### 10. Decisões de Design - REVISADAS

#### 10.1 Hierarquia vs Flat
**Escolhido:** Workspace > Collection > Items
- Collections são obrigatórias, items não podem existir sem collection
- Workspaces agrupam collections
- Navegação natural: seleciona workspace → vê suas collections → seleciona collection → vê items

#### 10.2 Collections Default vs Custom
- **Notes**: Só aceita notas, ícone fixo 📝, nome fixo "Notes"
- **Links**: Só aceita links, ícone fixo 🔗, nome fixo "Links"
- **Custom**: Aceita ambos, nome/ícone definidos pelo usuário

#### 10.3 Status/Estados
- Removido: Inbox
- Mantido: Favorites, Archive, Trash como **flags** em cada item
- Filtros globais mostram items de **todas as collections** do workspace ativo

#### 10.4 Criação de Items
- Dropdown "New" mostra opções baseadas na collection ativa:
  - Collection Notes: só mostra "New Note"
  - Collection Links: só mostra "New Link"
  - Collection Custom: mostra ambos
- Items são criados sempre na collection ativa

#### 10.5 Deleção
- Soft delete: item vai para Trash (isDeleted=true)
- Deletar collection custom:
  - Se vazia: deleta direto
  - Se tem items: opção de deletar tudo OU mover para uma collection default

---

### 11. Estrutura Final de Arquivos

```
src/
├── lib/
│   ├── components/
│   │   ├── MarkdownRenderer.svelte      # NOVO
│   │   ├── NoteCard.svelte              # NOVO
│   │   ├── NoteEditor.svelte            # NOVO
│   │   ├── NoteForm.svelte              # NOVO
│   │   ├── NoteItem.svelte              # NOVO
│   │   ├── CollectionForm.svelte        # NOVO
│   │   ├── CollectionCard.svelte        # NOVO (preview na listagem)
│   │   ├── AppSidebar.svelte            # REESCRITO
│   │   ├── WorkspaceHeader.svelte       # ATUALIZADO
│   │   └── ...existing components
│   ├── stores/
│   │   ├── domain/
│   │   │   ├── collections.svelte.ts    # NOVO
│   │   │   ├── notes.svelte.ts          # NOVO
│   │   │   ├── links.svelte.ts          # ATUALIZADO (collectionId)
│   │   │   └── workspaces.svelte.ts     # ATUALIZADO (cria defaults)
│   │   ├── infra/
│   │   │   ├── repository.ts            # ATUALIZADO (collections)
│   │   │   └── ...
│   │   └── ui/
│   │       ├── filters.svelte.ts        # ATUALIZADO (status, não inbox)
│   │       └── settings.svelte.ts
│   ├── server/
│   │   └── db/
│   │       ├── schema.ts                # ATUALIZADO (collections, notes, FKs)
│   │       └── index.ts
│   ├── types.ts                         # ATUALIZADO
│   └── constants.ts                     # ATUALIZADO
├── routes/
│   ├── api/
│   │   ├── collections/                 # NOVO
│   │   │   ├── +server.ts
│   │   │   └── [id]/
│   │   │       └── +server.ts
│   │   ├── notes/                       # NOVO
│   │   │   ├── +server.ts
│   │   │   └── [id]/
│   │   │       └── +server.ts
│   │   ├── links/                       # ATUALIZADO
│   │   └── ...
│   ├── +page.svelte                     # ATUALIZADO
│   └── ...
└── ...
```

---

## Resumo da Nova Arquitetura

**Principais Mudanças:**

✅ **Removemos Inbox** - Vibe de email eliminada
✅ **Collections como centro** - Navegação mais intuitiva e flexível
✅ **Defaults imutáveis** - Notes e Links sempre existem em cada workspace
✅ **Custom collections** - Usuário cria pastas para projetos/assuntos
✅ **Hierarquia clara** - Workspace > Collection > Items
✅ **Filtros globais** - Favorites/Archive/Trash independentes de collections
✅ **Type safety** - Collections têm tipo (notes/links/custom) validando o que aceitam
✅ **Extensível** - Fácil adicionar novos tipos de items no futuro (documents, tasks, etc)

**Mantemos:**
- ✅ Local-first com SQLite
- ✅ 3 camadas de stores (domain/infra/ui)
- ✅ Branded types
- ✅ Optimistic updates
- ✅ Design Linear
- ✅ Markdown com edit/view modes
