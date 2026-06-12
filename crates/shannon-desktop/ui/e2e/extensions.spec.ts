import { test, expect } from '@playwright/test'

test.describe('Extensions pages', () => {
  test('navigates to extensions hub (skills)', async ({ page }) => {
    await page.goto('/extensions/skills')
    await expect(page.getByText(/Skills|Extensions Hub/i)).toBeVisible()
  })

  test('navigates to my agents page', async ({ page }) => {
    await page.goto('/extensions/agents')
    await expect(page.getByText(/My Agents/i)).toBeVisible()
  })

  test('shows no agents message', async ({ page }) => {
    await page.goto('/extensions/agents')
    await expect(page.getByText(/No agents running/i)).toBeVisible()
  })

  test('navigates to data sources page', async ({ page }) => {
    await page.goto('/extensions/datasources')
    await expect(page.getByText(/Data Sources|MCP/i)).toBeVisible()
  })

  test('extensions tab navigation works', async ({ page }) => {
    await page.goto('/extensions/skills')
    // Click the Agents tab if visible
    const agentsTab = page.getByRole('link', { name: /Agents/i }).first()
    if (await agentsTab.isVisible()) {
      await agentsTab.click()
      await expect(page.getByText(/My Agents/i)).toBeVisible()
    }
  })
})

test.describe('OPC pages', () => {
  test('navigates to OPC board', async ({ page }) => {
    await page.goto('/opc')
    await expect(page.getByText(/Strategic Focus|KANBAN/i)).toBeVisible()
  })

  test('OPC board shows kanban columns', async ({ page }) => {
    await page.goto('/opc')
    await expect(page.getByText('To Do')).toBeVisible()
    await expect(page.getByText('Doing')).toBeVisible()
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('OPC board shows agent swarm section', async ({ page }) => {
    await page.goto('/opc')
    await expect(page.getByText(/Agent Swarm/i)).toBeVisible()
  })

  test('navigates to OPC task detail', async ({ page }) => {
    await page.goto('/opc/task')
    await expect(page.getByText(/Agent Workflow|Execution Log/i)).toBeVisible()
  })

  test('OPC task shows efficiency metrics', async ({ page }) => {
    await page.goto('/opc/task')
    await expect(page.getByText(/Efficiency Metrics/i)).toBeVisible()
  })
})

test.describe('Goals and Tasks pages', () => {
  test('goals page shows task management heading', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.getByText(/Task Management/i)).toBeVisible()
  })

  test('goals page shows search input', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.getByPlaceholder(/Search tasks/i)).toBeVisible()
  })

  test('tasks page shows scheduled tasks heading', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByText(/Scheduled Tasks/i)).toBeVisible()
  })

  test('tasks page shows new task button', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page.getByRole('button', { name: /New Task|Create Task/i })).toBeVisible()
  })
})
