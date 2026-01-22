import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/input/RichTextEditor";
import { useCreateTermsConditionsMutation } from "@/features/terms-conditions/termsConditionsApiSlice";

const termsConditionsSchema = yup.object().shape({
  content: yup
    .string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),
});

function CreateTermsConditionsPage() {
  const navigate = useNavigate();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(termsConditionsSchema),
  });
  const [createTermsConditions, { isLoading: isCreating }] = useCreateTermsConditionsMutation();

  const onSubmit = async (data) => {
    const payload = {
      content: data.content,
    };

    const res = await createTermsConditions(payload);
    if (res?.data) {
      toast.success("Terms & Conditions created");
      reset();
      navigate("/terms-conditions");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create Terms & Conditions");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/terms-conditions")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Terms & Conditions</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Create terms and conditions for your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              placeholder="Terms & Conditions Content"
              value={field.value || ""}
              onChange={field.onChange}
              error={errors.content}
              height="400px"
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/terms-conditions")}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateTermsConditionsPage;
