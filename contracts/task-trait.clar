;; task-trait.clar
(define-trait task-trait (
    (schedule-task (uint (string-ascii 64)) (response uint uint))
    (execute-task (uint) (response bool uint))
    (get-task (uint) 
        (response 
            (optional (tuple 
                (task-id uint)
                (name (string-ascii 64))
                (interval uint)
                (next-execution uint)
                (owner principal)
                (status (string-ascii 16))
            )) uint)
        )
    (cancel-task (uint) (response bool uint))
    (update-interval (uint uint) (response bool uint))
    (is-due (uint) (response bool uint))
))
