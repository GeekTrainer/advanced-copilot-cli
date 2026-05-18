# Advanced Copilot CLI — Internal Outline

> **Source:** [Advanced Copilot CLI.docx](https://microsoft-my.sharepoint.com/personal/chrhar_microsoft_com/_layouts/15/Doc.aspx?sourcedoc=%7BACCD6482-1C0B-4145-B08C-CD38A5AD9DE3%7D&file=Advanced%20Copilot%20CLI.docx) by Christopher Harrison
>
> Extracted via WorkIQ on 2026-05-18. This is a verbatim snapshot of the doc's outline at that point in time — scenarios, tech topics, and exercises. Use this as the canonical reference when aligning repo content with the course outline. The source doc is authoritative; refresh this file when the doc changes.
>
> The doc has **seven instructional modules**. There is **no Prerequisites module** and **no Wrap-up module** in the source — this repo adds `00-prerequisites.md` and `08-wrap-up.md` as bookends; those are intentional repo-only additions.

## Repo ↔ doc mapping

| Doc module | Repo file |
|---|---|
| 1. Working with Copilot CLI | `content/01-working-with-copilot-cli.md` |
| 2. Build an AI infrastructure foundation | `content/02-building-ai-infrastructure.md` |
| 3. Enhance the test suite with remote control and delegation | `content/03-test-suite-remote-delegation.md` |
| 4. Shape Copilot CLI's lifecycle with hooks | `content/04-lifecycle-hooks.md` |
| 5. Add a new feature | `content/05-add-feature-barcode.md` |
| 6. Modernize apps with Copilot CLI | `content/06-modernize-apps.md` |
| 7. Manage Copilot's infrastructure | `content/07-manage-infrastructure.md` |
| *(repo-only)* | `content/00-prerequisites.md` |
| *(repo-only)* | `content/08-wrap-up.md` |

---

## 1. Working with Copilot CLI

### Scenario

You've been assigned as a new developer to Contoso Inventory. As with most internal tools, the collection of technologies is a hodge podge, having evolved over time as skillsets and teams morphed and changed. The first step to being a productive developer on the project is to figure out where things are. And the first step to working effectively with Copilot CLI is exploring it's core functionality and how it works internally. You'll also tackle one of the most pressing issues – updating the documentation in the app.

### Tech topics

- Understanding AI agents
- Copilot CLI under the hood

### Exercises

- Explore the project using Copilot CLI
- Generate updates to documentation

### Internal notes

- This exercise is a bit tricky for a robust set of exercises. We're mostly talking about internal workings and other core concepts.

---

## 2. Build an AI infrastructure foundation

### Scenario

Contoso has a set of best practices and guidelines that need to be followed when creating code. This includes naming conventions, accessibility requirements, and policies around pull requests. To ensure Copilot follows these policies, a set of instructions files, custom agents, and agent skills – your AI infrastructure – needs to be created.

### Tech topics

- Instructions files
- Custom agents
- Agent skills

### Exercises

- Generate and use instructions files to guide code generation
- Import and use custom agents to perform accessibility reviews and updates
- Import and use agent skills to create issues and pull requests

---

## 3. Enhance the test suite with remote control and delegation

### Scenario

With the accessibility updates performed, it's time to validate the changes were successful. Fortunately, this can be done with Playwright tests. Creating tests can take time but has clearly defined success – perfect to delegate! Offload the creation of Playwright tests to Copilot Cloud Agent. And, while we're at it, let's flesh out the unit tests as well!

### Tech topics

- `/remote`
- `/delegate`
- Copilot cloud agent

### Exercises

- Begin the process of creating tests
- Use `/remote` to enable remote access
- Use `/delegate` to offload to CCA

---

## 4. Shape Copilot CLI's lifecycle with hooks

### Scenario

With your test suite created, you want to ensure Copilot automatically executes them – and your linter and the build process – as part of its lifecycle. This will ensure higher quality code, catching potential issues faster and allowing Copilot to quickly course correct. Let's see how we can do this using hooks.

### Tech topics

- Hooks

### Exercises

- Create a hook to automatically run build and test processes
- Run a command and watch it in action!

---

## 5. Add a new feature

### Scenario

- Add barcode support

### Tech topics

- Custom agents (QA agent and accessibility agent)
- `/plan` & rubber duck
- `/research` to find good libraries
- `/fleet`

### Exercises

- Use research to locate libraries to support creation of QR codes
- Use plan to create and vet the plan, and rubber duck it
- Use fleet to begin work on it, calling out to accessibility agent for accessibility and QA agent to act as quality gate

---

## 6. Modernize apps with Copilot CLI

### Scenario

As more packages become end of life, the timing around modernizing the application has become more critical. However, modernizing an application requires a lot of planning, orchestration and execution. Let's explore the tooling in Copilot CLI which can help support your efforts, while upgrading the older microservice in the application.

### Tech topics

- `/research`
- `/lsp`
- MCP servers
- Custom agents

### Exercises

- Add LSP configuration to aid Copilot in exploring the project
- Register MCP servers to enhance Copilot's access to documentation
- Use `/research` to determine the best approaches to modernizing the application
- Use custom agents to perform the upgrades

### Author notes

- We'll briefly talk about the modernization tools
- This is not meant to be a full conversation on modernization

---

## 7. Manage Copilot's infrastructure

### Scenario

Scaling Copilot's impact requires all developers having access to the right set of tools: MCP servers, instructions files, custom agents and agent skills. Let's explore how best to distribute the tooling, ensuring centralized management and broad distribution.

### Tech topics

- Custom agents defined at the enterprise level
- Plugins to distribute
- Custom MCP servers

### Exercises

- Create a custom MCP server to provide access to the database
- Explore enterprise-level custom agents
- Create a plugin with custom agents, instructions and skills
