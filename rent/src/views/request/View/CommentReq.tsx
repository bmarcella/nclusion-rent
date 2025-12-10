/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale"; // Optional: For readable dates
import UserName from "@/views/bank/show/components/UserName";


interface CommentListProps {
 userId : string ,
 comments: {
    by_who: string,
    status: string,
    text : string , 
    createdAt: Date,
 } []
}

const CommentReq: React.FC<CommentListProps> = ({ comments, userId }) => {
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
              Par <span className="font-medium">{ (comment.by_who == userId) ? 'Moi' : <UserName userId={comment.by_who} /> }</span> •{" "}
              { formatRelative(comment.createdAt.toDate?.() || comment.createdAt, new Date(), { locale: fr } ) }
            </div>
          </div>
         )) }
      </div>
    </div>
  );
};

export default CommentReq;
