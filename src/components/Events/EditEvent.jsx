import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, queryClient, updateEvent } from "../../util/http.js";
import { Fragment } from "react";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { eventId: params.id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isError: isMutationError,
    error: mutationError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: (data) => {
      const newevent = data.event;

      queryClient.cancelQueries({
        queryKey: ["events", { eventId: params.id }],
      });

      const oldEvent = queryClient.getQueryData([
        "events",
        { eventId: params.id },
      ]);

      queryClient.setQueryData(["events", { eventId: params.id }], newevent);

      return { oldEvent: oldEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ["events", { eventId: params.id }],
        context.oldEvent
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", { eventId: params.id }],
      });
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    // navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <Fragment>
        <ErrorBlock
          title="An Error Occurred"
          message={error.info?.message || "Failed To Fetch Data"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Ok
          </Link>
        </div>
      </Fragment>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}
