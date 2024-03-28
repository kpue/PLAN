import PocketBase from 'pocketbase'
import type { TypedPocketBase,ProjectsResponse } from '@src/data/pocketbase-types'

export const pb = new PocketBase(import.meta.env.POCKETBASE_URL || process.env.POCKETBASE_URL) as TypedPocketBase

// Disable pocketbase automatic cancellation of duplicate requests
pb.autoCancellation(false)

export async function getProject(id: string) {
    const project = await pb
    .collection('projects')
    .getOne(id)

    return project
}

export async function getProjects() {
    const projects = await pb
    .collection('projects')
    .getFullList()

    return projects.sort((a, b) => getStatus(a) - getStatus(b))
}

export async function addProject(name: string) {
    const newProject = await pb
    .collection('projects')
    .create({
        name,
        status: 'not started',
    })

    return newProject
}

export async function deleteProject(id: string) {
    await pb.collection('projects').delete(id)
}

export async function getTasks(project_id: string) {
    const options = {
        filter: `project = "${project_id}"`,
    }

    const tasks = await pb
    .collection('tasks')
    .getFullList(options)

    return tasks
}

export async function addTask(
    project_id: string,
    text: string
) {
    const newTask = await pb
    .collection('tasks').create({
        project: project_id,
        text: text
    })

    return newTask
}

function getStatus(project: ProjectsResponse) {
    switch(project.status) {
        case "not started":
            return 7
        case "on hold":
            return 6
        case "started":
            return 5
        case "in progress":
            return 4
        case "almost finished":
            return 3
        case "ongoing":
            return 2
        case "done":
            return 1
        default:
            return 0
    }
}