# Tutorials

Step-by-step guides for using Miro MCP with AI assistants.

## Official Tutorials

| Tutorial | Description | Client |
|----------|-------------|--------|
| [Generate Diagrams from Code](https://developers.miro.com/docs/guided-tutorial-generating-code-diagrams-with-miro-mcp-vs-code) | Create architecture diagrams from your codebase | VSCode + Copilot |
| [Build a Node.js App from Miro](https://developers.miro.com/docs/tutorial-build-a-nodejs-app-from-a-miro-board-with-miro-mcp-cursor) | Generate a working app from board designs | Cursor |
| [Build a Landing Page](https://developers.miro.com/docs/tutorial-how-to-build-a-lovable-landing-page-based-on-miro-board-context) | Create a landing page from Miro wireframes | Lovable |

## Video Tutorials

Watch the [Miro MCP YouTube Playlist](https://www.youtube.com/playlist?list=PLmiHe0R4hbzSGgHWYFYwvbAKTvFPRvG2a) for video walkthroughs.

## Example Prompts

### Creating Diagrams

**Flowchart from description:**
```
Create a flowchart on my Miro board showing the user registration process:
- Start with email input
- Validate email format
- Check if user exists
- Send verification email
- Wait for confirmation
- Create account
- Redirect to dashboard
```

**Architecture diagram from code:**
```
Create a system architecture diagram on https://miro.com/app/board/abc=
based on the code in this repository. Show the main components and
their relationships.
```

**Database schema:**
```
Create an ER diagram on my Miro board for an e-commerce database with:
- Users (id, email, name)
- Products (id, name, price, category_id)
- Categories (id, name)
- Orders (id, user_id, total, status)
- OrderItems (id, order_id, product_id, quantity)
```

### Creating Documents

**Meeting notes:**
```
Create a document on my Miro board for sprint planning:
- Sprint goals
- Team assignments
- Key milestones
- Risks and blockers
```

**Project summary:**
```
Create a project overview document on https://miro.com/app/board/abc=
summarizing the key features, timeline, and team responsibilities.
```

### Working with Tables

**Task tracker:**
```
Create a task tracking table on my Miro board with columns:
- Task (text)
- Assignee (text)
- Status (select: To Do, In Progress, Review, Done)
- Priority (select: Low, Medium, High)
```

**Add data to table:**
```
Add these tasks to the table on my Miro board:
1. Implement login - Alice - In Progress - High
2. Fix navigation bug - Bob - To Do - Medium
3. Update documentation - Carol - Review - Low
```

### Extracting Content

**Get board summary:**
```
Summarize the content on my Miro board https://miro.com/app/board/abc=
```

**Extract specifications:**
```
Extract the technical requirements from the wireframes on my Miro board.
Focus on the user authentication screens.
```

**Generate code from design:**
```
Based on the UI designs on my Miro board, generate React components
for the login and registration screens.
```

### Browsing Boards

**List frames:**
```
What frames are on my Miro board https://miro.com/app/board/abc=?
```

**Explore content:**
```
Show me what's on my Miro board and describe each section.
```

## Workflow Examples

### Design-to-Code Workflow

1. **Prepare your Miro board** with wireframes and annotations
2. **Ask for a summary**: "What's on my Miro board?"
3. **Extract requirements**: "Extract the functional requirements from the wireframes"
4. **Generate code**: "Create React components based on these requirements"

### Documentation Workflow

1. **Create the document**: `/miro:doc https://board-url project documentation`
2. **Add content sections**: Ask for specific sections to be added
3. **Refine and edit**: Request changes to specific sections

### Collaboration Workflow

1. **Create a task table**: `/miro:table https://board-url sprint tasks`
2. **Enable tracking**: `/miro-tasks:enable https://table-url`
3. **Work on tasks**: As you complete work, tasks are tracked
4. **Review status**: `/miro-tasks:status`

## Tips for Better Results

### Board Organization

- **Use frames** to group related content
- **Name items clearly** - names become code identifiers
- **Add annotations** for complex logic
- **Show relationships** with connectors

### Prompting

- **Be specific** about what you want created
- **Provide context** about the purpose
- **Include the board URL** explicitly
- **Describe the output format** you need

### Diagrams

- **Specify the diagram type** for complex requests
- **List the components** and relationships
- **Mention flow direction** (top-down, left-right)
- **Use Mermaid notation** for precise control

## Full Documentation

- [Miro MCP Intro](https://developers.miro.com/docs/mcp-intro)
- [Miro MCP Tools & Prompts](https://developers.miro.com/docs/miro-mcp-prompts)
- [Connecting to Miro MCP](https://developers.miro.com/docs/connecting-to-miro-mcp)
