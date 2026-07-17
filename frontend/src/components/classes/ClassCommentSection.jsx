import {
  useCallback,
  useEffect,
  useState
}
from "react";

import {
  CornerDownRight,
  Pin,
  Send
}
from "lucide-react";

import api
from "../../api/axios";

import {
  getApiErrorMessage,
  notifyError,
  notifySuccess
}
from "../../utils/toast";

const formatDate =
  (value)=>
    value
      ? new Date(value).toLocaleString()
      : "";

function RoleBadge({
  role
}) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
      {role}
    </span>
  );
}

function CommentAuthor({
  comment
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-gray-900">
        {comment.author?.name || "User"}
      </span>
      <RoleBadge
        role={comment.author?.role || "USER"}
      />
      <span className="text-xs text-gray-500">
        {formatDate(comment.createdAt)}
      </span>
    </div>
  );
}

function ClassCommentSection({
  endpoint,
  canPin = false
}) {
  const [
    comments,
    setComments
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    content,
    setContent
  ] = useState("");

  const [
    replyDrafts,
    setReplyDrafts
  ] = useState({});

  const [
    replyingTo,
    setReplyingTo
  ] = useState(null);

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    pinningId,
    setPinningId
  ] = useState(null);

  const fetchComments =
    useCallback(
      async ()=>{
        try{
          setLoading(true);

          const response =
            await api.get(endpoint);

          setComments(
            response.data
          );
        }catch(error){
          console.error(error);

          notifyError(
            getApiErrorMessage(error)
          );
        }finally{
          setLoading(false);
        }
      },
      [endpoint]
    );

  useEffect(()=>{
    fetchComments();
  },[
    fetchComments
  ]);

  const postComment =
    async (parentId)=>{
      const draft =
        parentId
          ? replyDrafts[parentId] || ""
          : content;

      if(!draft.trim()){
        notifyError("Enter a comment first");
        return;
      }

      try{
        setSubmitting(true);

        await api.post(
          endpoint,
          {
            content:draft,
            ...(parentId
              ? {
                  parentId
                }
              : {})
          }
        );

        if(parentId){
          setReplyDrafts(
            previous=>({
              ...previous,
              [parentId]:""
            })
          );

          setReplyingTo(null);
        }else{
          setContent("");
        }

        await fetchComments();

        notifySuccess("Comment posted");
      }catch(error){
        console.error(error);

        notifyError(
          getApiErrorMessage(error)
        );
      }finally{
        setSubmitting(false);
      }
    };

  const togglePin =
    async (comment)=>{
      try{
        setPinningId(comment.id);

        await api.patch(
          `${endpoint}/${comment.id}/pin`,
          {
            pinned:!comment.pinned
          }
        );

        await fetchComments();
      }catch(error){
        console.error(error);

        notifyError(
          getApiErrorMessage(error)
        );
      }finally{
        setPinningId(null);
      }
    };

  const renderComment =
    (comment)=>(
      <div
        key={comment.id}
        className={
          comment.pinned
            ? "border border-teal-200 bg-teal-50 rounded-2xl p-4"
            : "border border-gray-100 bg-gray-50 rounded-2xl p-4"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <CommentAuthor comment={comment} />
            {comment.pinned && (
              <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#008C95]">
                <Pin size={13} />
                Pinned
              </div>
            )}
          </div>

          {canPin && (
            <button
              type="button"
              title={comment.pinned ? "Unpin comment" : "Pin comment"}
              onClick={()=>
                togglePin(comment)
              }
              disabled={pinningId === comment.id}
              className="p-2 rounded-xl hover:bg-white text-gray-500 hover:text-[#008C95] disabled:opacity-50"
            >
              <Pin
                size={17}
                fill={comment.pinned ? "currentColor" : "none"}
              />
            </button>
          )}
        </div>

        <p className="mt-3 text-gray-700 whitespace-pre-wrap">
          {comment.content}
        </p>

        <button
          type="button"
          onClick={()=>
            setReplyingTo(
              replyingTo === comment.id
                ? null
                : comment.id
            )
          }
          className="mt-3 text-sm font-semibold text-[#008C95]"
        >
          Reply
        </button>

        {replyingTo === comment.id && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              value={replyDrafts[comment.id] || ""}
              onChange={(event)=>
                setReplyDrafts(
                  previous=>({
                    ...previous,
                    [comment.id]:event.target.value
                  })
                )
              }
              placeholder="Write a reply"
              className="flex-1 border rounded-xl px-4 py-3 bg-white"
            />
            <button
              type="button"
              onClick={()=>
                postComment(comment.id)
              }
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 bg-[#008C95] text-white px-4 py-3 rounded-xl disabled:opacity-50"
            >
              <Send size={16} />
              Send
            </button>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map(
              reply=>(
                <div
                  key={reply.id}
                  className="flex gap-3"
                >
                  <CornerDownRight
                    size={18}
                    className="mt-4 text-gray-400 shrink-0"
                  />
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4">
                    <CommentAuthor comment={reply} />
                    <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );

  return (
    <div className="bg-white rounded-3xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold">
            Class Comments
          </h2>
          <p className="text-sm text-gray-500">
            Questions, doubts, and replies for this class.
          </p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-2xl p-4 mb-5">
        <textarea
          value={content}
          onChange={(event)=>
            setContent(event.target.value)
          }
          placeholder="Ask a question or share a doubt"
          rows={3}
          className="w-full resize-none outline-none text-gray-700"
        />

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={()=>
              postComment()
            }
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-[#008C95] text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            <Send size={16} />
            Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Loading comments...
        </div>
      ) : comments.length ? (
        <div className="space-y-4">
          {comments.map(renderComment)}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          No comments yet
        </div>
      )}
    </div>
  );
}

export default ClassCommentSection;
