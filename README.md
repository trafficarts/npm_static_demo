[English version](./README.en.md) | Детальнее на [канале Traffic Arts](https://t.me/trafficarts)

# Хостинг произвольных страниц на npm

Полноценный пример того, как реестр npm и его зеркала могут использоваться как бесплатный, «доверенный» хостинг для произвольных HTML-страниц.

## Почему это работает

Реестр npm создан для распространения JavaScript-пакетов. Но ничто не мешает опубликовать пакет, содержащий HTML-страницу вместо (или помимо) кода. После публикации зеркала вроде [unpkg](https://unpkg.com), [npmmirror](https://npmmirror.com) и других автоматически отдают файлы — включая рендеринг HTML прямо в браузере.

Результат: полноценная HTML-страница на доверенном домене, с валидным TLS, кешированием CDN и нулевыми затратами на инфраструктуру.

Именно это [задокументировала OX Security](https://www.ox.security/blog/research-clickfix-phishing-npm-packages) в своём исследовании ClickFix-фишинга — злоумышленники опубликовали 24 npm-пакета с фейковыми страницами Cloudflare Captcha, а затем использовали unpkg и другие зеркала для отображения этих страниц на доверенных доменах. Установка пакетов безвредна; атака происходит, когда кто-то открывает URL зеркала в браузере.

## Как это работает (по шагам)

### 1. Создайте страницу

Напишите одну HTML-страницу или соберите её через Vite/webpack/etc. Единственное требование: итоговый файл должен называться `index.html`.

### 2. Подготовьте npm-пакет

Создайте минимальный `package.json`:

```json
{
  "name": "@yourname/your-package",
  "version": "1.0.0",
  "description": "Описание вашей страницы",
  "license": "MIT",
  "files": [
    "index.html"
  ],
  "unpkg": "./index.html",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

Ключевые поля:

- **`files`**: Только `index.html`. Никакого исходного кода, никаких лишних файлов — только страница.
- **`unpkg`**: Указывает unpkg, какой файл отдавать, если открыт URL пакета без указания имени файла.
- **`publishConfig.access`**: `public` — чтобы пакет сразу был виден на зеркалах.

### 3. Опубликуйте

```bash
# Войдите в npm
npm login

# Опубликуйте из директории с package.json и index.html
npm publish --access public
```

Всё. Без шага сборки, без CI-пайплайна, без инфраструктуры. Одна команда.

### 4. Откройте страницу

После публикации (обычно от нескольких секунд до пары минут на зеркалах):

```
# unpkg (рендерит HTML напрямую)
https://unpkg.com/@yourname/your-package@1.0.0/index.html

# npmmirror
https://registry.npmmirror.com/@yourname/your-package/1.0.0/files/index.html
```

Если задано поле `unpkg` в `package.json`, работает и короткий URL:

```
https://unpkg.com/@yourname/your-package@1.0.0
```

## Этот репозиторий

Репозиторий автоматизирует описанное выше с помощью Vite-пайплайна, который собирает автономную HTML-страницу (весь CSS, JS и картинки инлайнены) и публикует её в npm через GitHub Actions.

### Пайплайн сборки

`npm run build` делает следующее:

1. **Vite** собирает JS и CSS с production-минификацией.
2. **`vite-plugin-singlefile`** встраивает весь JS и CSS в `index.html`, удаляя отдельные файлы бандлов.
3. **Картинки**, импортированные через `?inline`, встраиваются как `data:image/webp;base64,...`.
4. **`html-minifier-terser`** сжимает итоговый HTML, инлайн CSS и инлайн JS.
5. **`package.publish.json`** копируется в `dist/package.json` — это метаданные, которые публикуются.

В `dist/` оказывается ровно два файла:

```
dist/
├── index.html      # HTML + инлайн CSS + инлайн JS + картинки как data: URIs
└── package.json    # метаданные npm-пакета
```

### Публикация

**Через Git-тег (рекомендуется):**

```bash
git tag v1.0.1
git push origin main --tags
```

GitHub Action `publish.yml` собирает страницу и запускает `npm publish`.

**Через интерфейс GitHub Actions:**

Actions → Publish to npm → Run workflow. Будет опубликована версия из `package.publish.json`.

**Аутентификация npm**: первая публикация требует GitHub secret `NPM_TOKEN` с правом publish и обходом 2FA. После появления пакета настройте [Trusted Publisher](https://www.npmjs.com) для GitHub Actions: repository `trafficarts/npm_static_demo`, workflow filename `publish.yml`, разрешённое действие `npm publish`. Затем удалите `NPM_TOKEN`: workflow будет публиковать через OIDC. Поле `repository` в публикуемом package metadata уже совпадает с этим GitHub repository.

### Структура проекта

```
index.html                    HTML-шаблон
src/main.js                   Логика страницы
src/config.js                 Runtime-конфигурация через VITE_* переменные
src/style.css                 Стили
src/assets/image.webp         Картинка
vite.config.js                Vite + single-file сборка
scripts/minify-html.mjs       Минификация HTML
package.publish.json          Метаданные для публикуемого npm-пакета
.github/workflows/ci.yml      Проверка сборки при push/PR
.github/workflows/publish.yml npm publish по тегу или вручную
```

### Локальная разработка

```bash
npm install
npm run dev          # dev-сервер
npm run build        # production-сборка
npm run pack:check   # проверка содержимого будущего tarball
```

### CI (только проверка сборки)

```bash
npm run ci:local     # запуск того же CI-workflow через nektos/act
```

Требуется Docker и `act` (`brew install act`). Запускает тот же GitHub Actions workflow локально — install, build, `npm pack --dry-run` — без публикации чего-либо.

## Что это значит для безопасности

Регистрация в npm бесплатна. Публикация бесплатна. Зеркала отдают файлы бесплатно. HTML-страницы рендерятся в браузере без предупреждений. URL наследует доверие домена хостинга (unpkg.com и т.д.).

Для специалистов по безопасности это означает:

- Считать домены зеркал npm потенциальными хостами для фишинга, когда они используются не для скачивания пакетов.
- Добавлять URL зеркал в пайплайны фишинг-детекции и репутации URL.
- Мониторить proxy- и DNS-логи на прямые `.html`-запросы к зеркалам.

Для всех остальных — это напоминание, что **безопасность цепочки поставок шире, чем выполнение кода**. Пакету не нужно запускать скрипты `postinstall` или импортировать нативные модули, чтобы быть опасным — достаточно содержать HTML-файл.

## Ссылки

- [ClickFix Phishing Pages Discovered in 24 npm Packages — OX Security](https://www.ox.security/blog/research-clickfix-phishing-npm-packages)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [Vite: inlining assets](https://vite.dev/guide/assets.html#explicit-inline-handling)
- [GitHub Actions: Publishing npm packages](https://docs.github.com/actions/tutorials/publish-packages/publish-nodejs-packages)

## License

MIT
