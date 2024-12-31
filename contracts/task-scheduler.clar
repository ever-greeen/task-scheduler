(impl-trait .task-trait.task-trait)

;; Error Constants (consolidated)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u101))
(define-constant ERR-INVALID-INTERVAL (err u102))
(define-constant ERR-TASK-NOT-DUE (err u103))
(define-constant ERR-TASK-INACTIVE (err u104))

;; Data vars and maps (single definition)
(define-map tasks uint {
    task-id: uint,
    name: (string-ascii 64),
    interval: uint,
    next-execution: uint,
    owner: principal,
    status: (string-ascii 16)
})

(define-data-var task-counter uint u0)

;; Private helper functions
(define-private (validate-interval (interval uint))
    (> interval u0))

(define-private (validate-owner (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-TASK-NOT-FOUND)))
        (ok (is-eq tx-sender (get owner task)))))

;; Public functions implementing the trait

(define-public (schedule-task (interval uint) (name (string-ascii 64)))
    (begin
        (asserts! (validate-interval interval) ERR-INVALID-INTERVAL)
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
    ))

(define-public (execute-task (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-TASK-NOT-FOUND)))
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
    ))

(define-public (get-task (task-id uint))
    (ok (map-get? tasks task-id)))

(define-public (cancel-task (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-TASK-NOT-FOUND)))
        (begin
            (asserts! (unwrap-panic (validate-owner task-id)) ERR-NOT-AUTHORIZED)
            (map-set tasks task-id 
                (merge task {
                    status: "CANCELLED"
                })
            )
            (ok true)
        )
    ))

(define-public (update-interval (task-id uint) (new-interval uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-TASK-NOT-FOUND)))
        (begin
            (asserts! (unwrap-panic (validate-owner task-id)) ERR-NOT-AUTHORIZED)
            (asserts! (validate-interval new-interval) ERR-INVALID-INTERVAL)
            (map-set tasks task-id 
                (merge task {
                    interval: new-interval,
                    next-execution: (+ stacks-block-height new-interval)
                })
            )
            (ok true)
        )
    ))

(define-public (is-due (task-id uint))
    (let ((task (unwrap! (map-get? tasks task-id) ERR-TASK-NOT-FOUND)))
        (ok (>= stacks-block-height (get next-execution task)))
    ))
