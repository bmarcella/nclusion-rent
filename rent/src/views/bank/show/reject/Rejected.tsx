/* eslint-disable @typescript-eslint/no-explicit-any */
import AddComment from '../../add/components/AddComment'

interface Props {
    onSubmit: (data: any) => void
    bankId: string
    isEdit?: boolean
    userId: string
}
function Rejected({ onSubmit, bankId, userId }: Props) {
    return (
        <div>
            <AddComment
                bankId={bankId}
                userId={userId}
                btnText="Confirmé"
                onSubmitAfter={onSubmit}
            />
        </div>
    )
}
export default Rejected
