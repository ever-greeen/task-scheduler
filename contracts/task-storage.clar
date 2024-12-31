;; Task Storage Module
(define-data-var task-counter uint u0)

(define-map Tasks 
    { task-id: uint } 
    {
        owner: principal,
        name: (string-ascii 50),
        interval: uint,
        last-executed: uint,
        active: bool,
        execution-count: uint
    }
)

;; Storage operations
(define-read-only (get-task (task-id uint))
    (map-get? Tasks { task-id: task-id })
)

(define-private (set-task (task-id uint) (task-data {
    owner: principal,
    name: (string-ascii 50),
    interval: uint,
    last-executed: uint,
    active: bool,
    execution-count: uint
}))
    (map-set Tasks { task-id: task-id } task-data)
)

(define-read-only (get-next-task-id)
    (+ (var-get task-counter) u1)
)

(define-private (increment-task-counter)
    (var-set task-counter (get-next-task-id))
)