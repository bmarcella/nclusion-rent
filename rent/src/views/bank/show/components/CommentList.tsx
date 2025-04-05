import React from "react";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale"; // Optional: For readable dates
import UserName from "./UserName";

export type BankComment = {
  id?: string;
  bankId: string;
  text: string;
  createBy: string;
  createdAt: any;
  uploadedAt: any;
  updateBy: string;
};

interface CommentListProps {
  comments: BankComment[];
  userId: string,
}

const CommentList: React.FC<CommentListProps> = ({ comments, userId }) => {
  return (
    <div className="">
      { comments.length>0 && <h2 className="text-xl font-semibold mb-4">Commentaires</h2> }
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
          >
            <p className="text-sm text-gray-700 dark:text-gray-100 mb-1">
                {comment.text}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Par <span className="font-medium">{ (comment.createBy == userId) ? 'moi' : <UserName userId={comment.createBy} /> }</span> •{" "}
              { formatRelative(comment.createdAt.toDate?.() || comment.createdAt, new Date(), { locale: fr } ) }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentList;
