export const statusType = {
    notStarted: 'notStarted',
    inProgress: 'inProgress',
    completed: 'completed',
    started: 'started',
    submitted: 'submitted'
}
export const statuses: any = [
    { title: statusType.notStarted },
    { title: statusType.inProgress },
    { title: statusType.completed }
]

export const taskStatus = {
    notStarted: {
        label: "Not started",
        value: "notStarted"
    },
    inProgress: {
        label: "In Progress",
        value: "inProgress"
    },
    completed: {
        label: "Completed",
        value: "completed"
    }
} 
export const projectStatus = {
    started: {
        label: "Started",
        value: "started"
    },
    inProgress: {
        label: "In Progress",
        value: "inProgress"
    },
    submitted: {
        label: "Submitted",
        value: "submitted"
    }
}