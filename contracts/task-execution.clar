(impl-trait .task-trait.task-trait)

;; Error Constants
(define-constant ERR-TASK-NOT-DUE (err u103))
(define-constant ERR-TASK-INACTIVE (err u104))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-NOT-AUTHORIZED (err u403))

;; Data vars and maps
(define-map tasks uint {
    task-id: uint,
    name: (string-ascii 64),
    interval: uint,
    next-execution: uint,
    owner: principal,
    status: (string-ascii 16)
})

(define-data-var task-counter uint u0)

(define-public (schedule-task (interval uint) (name (string-ascii 64)))
    (let 
        (
            (task-id (+ (var-get task-counter) u1))
            (new-task {
                task-id: task-id,
                name: name,
                interval: interval,
                next-execution: (+ stacks-block-height interval),
                owner: tx-sender,
                status: "SCHEDULED"
            })
        )
        (begin
            (map-set tasks task-id new-task)
            (var-set task-counter task-id)
            (ok task-id)
        )
    )
)

(define-public (execute-task (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-NOT-FOUND)))
        (begin
            (asserts! (is-eq (get status task) "SCHEDULED") ERR-TASK-INACTIVE)
            (asserts! (>= stacks-block-height (get next-execution task)) ERR-TASK-NOT-DUE)
            (map-set tasks task-id 
                (merge task {
                    next-execution: (+ stacks-block-height (get interval task))
                })
            )
            (ok true)
        )
    )
)

(define-public (get-task (task-id uint))
    (ok (map-get? tasks task-id))
)

(define-public (cancel-task (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-NOT-FOUND)))
        (asserts! (is-eq tx-sender (get owner task)) ERR-NOT-AUTHORIZED)
        (begin
            (map-set tasks task-id 
                (merge task {
                    status: "CANCELLED"
                })
            )
            (ok true)
        )
    )
)

(define-public (update-interval (task-id uint) (new-interval uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-NOT-FOUND)))
        (asserts! (is-eq tx-sender (get owner task)) ERR-NOT-AUTHORIZED)
        (begin
            (map-set tasks task-id 
                (merge task {
                    interval: new-interval,
                    next-execution: (+ stacks-block-height new-interval)
                })
            )
            (ok true)
        )
    )
)

(define-public (is-due (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-NOT-FOUND)))
        (ok (>= stacks-block-height (get next-execution task)))
    )
)