;; Task Management Module
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u101))
(define-constant ERR-INVALID-INTERVAL (err u102))

(define-private (validate-owner (task {
    owner: principal,
    name: (string-ascii 50),
    interval: uint,
    last-executed: uint,
    active: bool,
    execution-count: uint
}))
    (is-eq tx-sender (get owner task))
)

(define-private (validate-interval (interval uint))
    (> interval u0)
)

(define-private (create-task-data (name (string-ascii 50)) (interval uint))
    {
        owner: tx-sender,
        name: name,
        interval: interval,
        last-executed: stacks-block-height,
        active: true,
        execution-count: u0
    }
)

(define-private (toggle-status (task {
    owner: principal,
    name: (string-ascii 50),
    interval: uint,
    last-executed: uint,
    active: bool,
    execution-count: uint
}))
    (merge task { active: (not (get active task)) })
)