/**
 * Auto-install Script Tag
 * This will add the chat widget to the store automatically
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  
  try {
    // Create script tag that loads the widget
    const response = await admin.rest.resources.ScriptTag.all({
      session: session,
    });

    // Check if already installed
    const existingScript = response.data.find(
      (script: any) => script.src === "https://shopchatai.indigenservices.com/embed.js"
    );

    if (existingScript) {
      return json({ 
        success: true, 
        message: "Widget already installed!",
        scriptId: existingScript.id 
      });
    }

    // Install the script tag
    const scriptTag = new admin.rest.resources.ScriptTag({ session: session });
    scriptTag.event = "onload";
    scriptTag.src = "https://shopchatai.indigenservices.com/widget-loader.js";
    scriptTag.display_scope = "all";
    
    await scriptTag.save({
      update: true,
    });

    return json({ 
      success: true, 
      message: "Widget installed successfully!",
      scriptId: scriptTag.id
    });

  } catch (error) {
    console.error("Script tag installation error:", error);
    return json({ 
      success: false, 
      error: "Failed to install widget",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  
  try {
    const response = await admin.rest.resources.ScriptTag.all({
      session: session,
    });

    const installedScripts = response.data.filter(
      (script: any) => 
        script.src.includes("shopchatai.indigenservices.com") ||
        script.src.includes("embed.js")
    );

    return json({ 
      installed: installedScripts.length > 0,
      scripts: installedScripts
    });

  } catch (error) {
    return json({ 
      installed: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
